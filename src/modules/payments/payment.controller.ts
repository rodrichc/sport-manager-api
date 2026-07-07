import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    webhook = async (req: Request, res: Response) => {
        try {
            const { type, data } = req.body;

            if (type === 'payment' && data && data.id) {
                await this.paymentService.processWebhook(data.id);
            }

            res.status(200).send("OK");
        } catch (error: any) {
            console.error("Webhook Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
