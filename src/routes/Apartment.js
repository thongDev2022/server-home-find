import express from "express";
import apartmentController from "../controllers/apartmentController.js";
import {authCheck,adminCheck, ownerCheck} from "../middleware/authCheck.js";
const router = express.Router();

const controller = new apartmentController();


router.post("/apartment/create",authCheck,adminCheck, apartmentController.createApartment);
router.get("/apartment/getAll",authCheck, apartmentController.getAllApartments);
router.get("/apartment/getOne/:id", apartmentController.getOneApartment);
router.put("/apartment/update/:id", authCheck, adminCheck, apartmentController.updateApartment);
router.delete("/apartment/delete/:id", authCheck, adminCheck, apartmentController.deleteApartment);


router.get("/apartment/searchPrice", apartmentController.searchByPrice);
router.get("/apartment/searchLocation", apartmentController.searchByLocation);
router.get("/apartment/searchCategory", apartmentController.searchByCategory);
router.get("/apartment/booked",authCheck, adminCheck, apartmentController.getBookedApartments);
router.get("/apartment/paid", authCheck,adminCheck,apartmentController.getPaidAparments);
router.get("/apartment/full", authCheck,adminCheck,apartmentController.getFullApartments);
router.get("/apartment/available", authCheck,adminCheck,apartmentController.getAvailableApartments);
router.get("/apartment/unpaid",authCheck,adminCheck, apartmentController.getUnpaidApartments);
router.get("/apartment/deposit",authCheck,adminCheck, apartmentController.getDepositApartments);
router.post("/apartment/uploadImage",controller.upload, controller.uploadImages);
export default router
