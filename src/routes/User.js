import express from "express";
import userController from "../controllers/userController.js";
import { authCheck } from "../middleware/authCheck.js";

const router = express.Router();

router.get("/user/selectAll", authCheck, userController.getAllUsers);
router.get("/user/selectOne/:id", authCheck, userController.getOneUser);
router.put("/user/updateProfile", authCheck, userController.updateProfile);
router.delete("/user/delete/:id", authCheck, userController.deleteUser);
router.put("/user/forget", authCheck, userController.forgetPassword);

router.get("/user/allTenants", authCheck, userController.getAllTenants);

export default router;
