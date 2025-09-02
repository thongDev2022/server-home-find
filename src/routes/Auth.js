import express from "express";
// import userController from "../controllers/authController.js";
import { authCheck } from "../middleware/authCheck.js";
import authController from "../controllers/authController.js";
const router = express.Router();

router.post("/user/register", authController.Register);
router.post("/user/login", authController.Login);
router.get("/user/current-user", authCheck, authController.currentUser);

export default router;
