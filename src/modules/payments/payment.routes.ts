import { Router } from "express";
import { paymentController } from "./payment.dependencies";

const router = Router();

router.post('/webhook', paymentController.webhook);

export default router;
