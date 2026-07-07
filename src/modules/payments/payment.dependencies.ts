import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";

export const paymentRepository = new PaymentRepository();
export const paymentService = new PaymentService(paymentRepository);
export const paymentController = new PaymentController(paymentService);
