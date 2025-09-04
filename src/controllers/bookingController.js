import STATUS from "../service/statusCodes.js";
import { PrismaClient } from "@prisma/client";

export default class bookingController {
  static async isApartmentAvailable(apartmentId, startDate, endDate) {
    const prisma = new PrismaClient();
    const bookings = await prisma.booking.findMany({
      where: {
        apartmentId: apartmentId,
        OR: [
          {
            startDate: {
              lte: endDate,
            },
            endDate: {
              gte: startDate,
            },
          },
        ],
      },
    });
    return bookings.length === 0;
  }

  static async createBooking(req, res) {
    try {
      //code
      const { apartmentId, startDate, endDate } = req.body;
      //validate input
      if (!startDate)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "startDate is required" });
      if (!endDate)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ messaege: "endDate is required" });

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start) || isNaN(end) || end <= start) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ messaege: "Invalid date range" });
      }

      const prisma = new PrismaClient();
      const apartment = await prisma.apartment.findUnique({
        where: { id: Number(apartmentId) },
      });
      if (!apartment) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Apartment not found" });
      }
      if (apartment.status !== "available") {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Apartment is not available for booking" });
      }

      // Check if the booking dates overlap with existing
      const isAvailable = await bookingController.isApartmentAvailable(
        apartmentId,
        start,
        end
      );
      if (!isAvailable) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Apartment is already booked for the selected dates",
        });
      }

      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      // const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = months * apartment.priceBooking;

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          userId: req.user.userId,
          apartmentId: parseInt(apartmentId),
          startDate: start,
          endDate: end,
          totalPrice: parseFloat(totalPrice),
        },
      });

      const updateApartmentStatus = await prisma.apartment.update({
        where: { id: Number(apartmentId) },
        data: { status: "booked" },
      });
      // res.status(STATUS.OK).json(updateApartmentStatus)

      res.status(STATUS.CREATED).json({
        success: true,
        messaege: "Created booking successfully",
        data: { booking },
      });
    } catch (err) {
      console.log(err);
      res.status(STATUS.INTERNAL_SERVER_ERROR).json("Server Error");
    }
  }

  static async getAllBookings(req, res) {
    try {
      const prisma = new PrismaClient();
      const bookings = await prisma.booking.findMany({
        include: {
          apartment: true,
          apartment: { include: { category: true } },
          user: {
            select: { user_id: true, username: true, email: true, phoneNumber: true },
          },
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all bookings successfully",
        data: { bookings },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  static async getMyBooking(req, res) {
    try {
      const userId = req.user.userId;
      const prisma = new PrismaClient();
      const myBooking = await prisma.booking.findFirst({
        where: { userId: userId },
        include: { apartment: true },
        orderBy: { createdAt: "desc" },
      });

      if (!myBooking)
        return res.status(STATUS.NOT_FOUND).json({
          success: false,
          messaege: "My booking not found",
          data: null,
        });

      res.status(STATUS.OK).json({
        success: true,
        messaege: "Get my booking successfullly",
        data: { myBooking },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ messaege: "Server Error" });
    }
  }

  static async updateBookingStatus(req, res) {
    try {
      const bookingId = Number(req.params.id);
      const { status } = req.body;
      const prisma = new PrismaClient();
      const updateStatus = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: status },
      });
      res.status(STATUS.OK).json({
        success: true,
        messaege: "Update booking status successfully",
        data:  updateStatus ,
      });
    } catch (err) {
      console.log(err);
      if (err.code === "P2025")
        return res
          .status(STATUS.NOT_FOUND)
          .json({ messaege: "Booking not found" });
      res.status(STATUS).json({ messaege: "Server Error" });
    }
  }

  static async cancelBooking(req, res) {
    try {
      const bookingId = Number(req.params.id);
      const { cancel } = req.body;
      const prisma = new PrismaClient();
      const cancelStatus = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: cancel },
      });
      res.status(STATUS.OK).json({
        success: true,
        messaege: "Booking cancelled",
        data:  cancelStatus ,
      });
    } catch (err) {
      console.log(err);
      if (err.code === "P2025")
        return res
          .status(STATUS.NOT_FOUND)
          .json({ messaege: "Booking not found" });
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ messaege: "Server Error" });
    }
  }
}
