import express from "express";
import property from "../controllers/propertyController.js";
import { adminCheck, authCheck } from "../middleware/authCheck.js";

const controller = new property()
const router = express.Router();
//Property CRUD
router.post("/property/create", authCheck, adminCheck, property.createProperty);
router.get("/property/getAll", property.propertyLists);
router.get("/property/getOne/:id", property.getPropertyById);
router.put("/property/update/:id", authCheck, adminCheck, property.updateProperty);
router.delete("/property/remove/:id", authCheck, adminCheck, property.removeProperty);

//Upload image
router.post("/property/upload-single", authCheck, adminCheck, controller.uploadImage);
router.post("/property/upload-multiple", authCheck, adminCheck,controller.uploadImages);
router.post("/property/remove-image", authCheck, adminCheck, controller.removeImage);

//Get property
router.get("/property/booked", authCheck, adminCheck, property.getBookedProperties );
router.get("/property/full", authCheck, adminCheck, property.getFullProperties);
router.get("/property/available", authCheck, adminCheck, property.getAvailableProperties);
router.get("/property/deposit", authCheck, adminCheck, property.getDepositProperties);
router.get("/property/unpaid", authCheck, adminCheck, property.getUnpaidProperties);
router.get("/property/paid", authCheck, adminCheck, property.getPaidProperties);

//Search property
router.get("/property/search-price", authCheck, property.searchByPrice);
router.get("/property/search-location",authCheck, property.searchByLocation);
router.get("/property/search-propertyType", authCheck, property.searchByPropertyType);

export default router;
