import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/appError";

export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    createPreference = catchAsync(async (req: Request, res: Response) => {
        const { bookingId } = req.body;
        const userId = req.user?.id; // Obtenido de tu middleware de auth

        if (!bookingId) {
            throw new AppError("El bookingId es requerido", 400);
        }

        if (!userId) {
            throw new AppError("Usuario no autenticado", 401);
        }

        const result = await this.paymentService.createPaymentIntention(Number(bookingId), userId);

        res.status(200).json({
            status: "success",
            data: result
        });
    });

    webhook = catchAsync(async (req: Request, res: Response) => {
        console.log("🔥 [WEBHOOK RECIBIDO] 🔥");
        console.log("Query:", req.query);
        console.log("Body:", req.body);

        const topic = req.query?.topic || req.body?.topic || req.query?.type || req.body?.type;
        const resourceId = req.query?.id || req.body?.data?.id || req.query?.['data.id'] || req.body?.id;

        console.log(`🔎 Evento detectado -> Topic/Type: ${topic} | ID: ${resourceId}`);

        if (resourceId) {
            try {
                if (topic === "payment" || topic === "payment.created" || topic === "payment.updated") {
                    console.log(`⏳ Procesando pago directo ${resourceId}...`);
                    await this.paymentService.processWebhook(String(resourceId));
                } else if (topic === "merchant_order" || topic === "topic_merchant_order_wh") {
                    console.log(`⏳ Procesando merchant_order ${resourceId}...`);
                    await this.paymentService.processMerchantOrder(String(resourceId));
                }
            } catch (err) {
                console.error(`❌ [Webhook Error]:`, err);
            }
        }

        // Siempre 200 OK a Mercado Pago
        res.status(200).send("OK");
    });
}