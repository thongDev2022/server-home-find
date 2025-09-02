import express from "express";
import categoryController from "../controllers/categoryController.js";
const router = express.Router();

router.post("/category/create", categoryController.createCategory);
router.get("/category/getAll", categoryController.getAllCategory);
router.put("/category/update/:id", categoryController.updateCategory);
router.delete("/category/delete/:id", categoryController.deleteCategory);

export default router