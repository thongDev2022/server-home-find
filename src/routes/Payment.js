import express from "express";
import payment from "../controllers/paymentController.js";
import { authCheck, adminCheck } from "../middleware/authCheck.js";

const router = express.Router();

router.post("/payment", authCheck, payment.create);
router.get("/payment", authCheck, adminCheck, payment.paymentList);
router.get("/payment/:id", authCheck, adminCheck, payment.getPaymentById);
router.patch("/payment", authCheck, adminCheck, payment.update);
router.delete("/payment/:id", authCheck, adminCheck, payment.remove);

export default router;
