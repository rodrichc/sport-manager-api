import { Router } from "express";
import { paymentController } from "./payment.dependencies";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/create-preference", authenticate, paymentController.createPreference);

router.post("/webhook", paymentController.webhook);

export default router;
