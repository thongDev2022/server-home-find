import express from "express";
// import userController from "../controllers/authController.js";
import { authCheck, adminCheck } from "../middleware/authCheck.js";
import authController from "../controllers/authController.js";
const router = express.Router();

router.post("/user/register", authController.Register);
router.post("/user/login", authController.Login);
router.post("/user/current-user", authCheck, authController.currentUser);
router.post("/user/current-admin", authCheck, adminCheck, authController.currentUser);

export default router;
