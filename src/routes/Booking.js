import express from "express";
import bookingController from "../controllers/bookingController.js";
import { authCheck, ownerCheck } from "../middleware/authCheck.js";
const router = express.Router();

router.post("/booking/create",authCheck, bookingController.createBooking);
router.get("/booking/getAll", authCheck,ownerCheck, bookingController.getAllBookings);
router.get("/booking/getMy", authCheck, bookingController.getMyBooking);
router.put("/booking/updateStatus/:id", authCheck, ownerCheck, bookingController.updateBookingStatus);
router.put("/booking/cancel/:id", authCheck, ownerCheck, bookingController.cancelBooking);

export default router