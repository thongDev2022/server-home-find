import express from "express";
import propertyType from "../controllers/propertyTypeController.js";

const router = express.Router();

router.post("/propertyType/create", propertyType.createPropertyType);
router.get("/propertyType/getAll", propertyType.getAllPropertyType);

export default router;
