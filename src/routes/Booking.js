import express from "express";
import bookingController from "../controllers/bookingController.js";
import { adminCheck, authCheck, ownerCheck } from "../middleware/authCheck.js";
const router = express.Router();

router.post("/booking/create",authCheck, bookingController.createBooking);
router.get("/booking/getAll", authCheck,adminCheck, bookingController.getAllBookings);
router.get("/booking/getMy", authCheck, bookingController.getMyBooking);
router.patch("/booking/updateStatus/:id", authCheck, adminCheck, bookingController.updateBookingStatus);
router.patch("/booking/cancel/:id", authCheck, adminCheck, bookingController.cancelBooking);
router.get("/booking/history", authCheck,adminCheck,bookingController.bookingHistory);
router.patch("/booking/check-in/:id", authCheck, bookingController.checkIn);
router.patch("/booking/check-out/:id", authCheck,bookingController.checkOut);
export default router