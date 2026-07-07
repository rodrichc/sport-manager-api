import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    webhook = async (req: Request, res: Response) => {
        try {
            const type = req.body?.type || req.query?.type;
            const dataId = req.body?.data?.id || req.query?.['data.id'];

            if (type === 'payment' && dataId) {
                await this.paymentService.processWebhook(dataId as string);
            }

            res.status(200).send("OK");
        } catch (error: any) {
            console.error("Webhook Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
