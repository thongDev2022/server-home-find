import STATUS from "../service/statusCodes.js";
import prisma from "../service/prismaClient.js";

export default class bookingController {
  static async isPropertyAvailable(propertyId, checkInDate, checkOutDate) {
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: propertyId,
        OR: [
          {
            checkIn: {
              lte: checkInDate,
            },
            checkOut: {
              gte: checkOutDate,
            },
          },
        ],
      },
    });
    return bookings.length === 0;
  }

  static async createBooking(req, res) {
    try {
      const { propertyId, checkIn, checkOut } = req.body;

      // 🧭 Validate input
      if (!propertyId) {
        return res.status(400).json({ message: "propertyId is required" });
      }
      if (!checkIn || !checkOut) {
        return res
          .status(400)
          .json({ message: "checkIn and checkOut are required" });
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate) || isNaN(checkOutDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (checkOutDate <= checkInDate) {
        return res
          .status(400)
          .json({ message: "checkOut must be after checkIn" });
      }

      // 🏠 Check property existence
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.status !== "AVAILABLE") {
        return res
          .status(400)
          .json({ message: "Property is not available for booking" });
      }

      // 📅 Check availability (no overlapping)
      const isAvailable = await bookingController.isPropertyAvailable(
        propertyId,
        checkInDate,
        checkOutDate
      );

      if (!isAvailable) {
        return res.status(400).json({
          message: "Property is already booked for the selected dates",
        });
      }

      // 💰 Calculate total price (by months or days)
      const months =
        (checkOutDate.getFullYear() - checkInDate.getFullYear()) * 12 +
        (checkOutDate.getMonth() - checkInDate.getMonth());

      const totalPrice =
        months > 0 ? months * property.rentPrice : property.rentPrice;

      // 🧾 Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: req.user.id,
          propertyId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice,
        },
      });

      // 🏡 Update property status
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: "BOOKED" },
      });

      return res.status(201).json({
        success: true,
        message: "Created booking successfully",
        booking,
      });
    } catch (err) {
      console.error("Create booking error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }

  static async getAllBookings(req, res) {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          property: true,
          property: { include: { propertyType: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all bookings successfully",
        bookings,
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
      const userId = req.user.id;
      console.log("userId: ", userId);
      const myBooking = await prisma.booking.findFirst({
        where: { userId: userId },
        include: { property: true },
        orderBy: { createdAt: "desc" },
      });

      if (!myBooking)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ messaege: "My booking not found" });

      res.status(STATUS.OK).json({
        success: true,
        messaege: "Get my booking successfullly",
        myBooking,
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
      const bookingId = req.params.id;
      const { newStatus } = req.body;
      // console.log("bookingId: ", bookingId);
      // console.log("newStatus: ", newStatus);
      const status = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: newStatus },
      });
      res.status(STATUS.OK).json({
        success: true,
        messaege: "Update booking status successfully",
        status,
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
      const bookingId = req.params.id;
      const { cancel } = req.body;
      console.log(bookingId);
      const cancelStatus = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: cancel },
      });
      res.status(STATUS.OK).json({
        success: true,
        messaege: "Booking cancelled",
        data: cancelStatus,
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

  static async bookingHistory(req, res) {
    try {
      const history = await prisma.booking.findMany({
        where: { status: "CONFIRMED" },
        include: {
          property: true,
          property: { include: { propertyType: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      if (!history && history.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ messaege: "No booking history" });
      }
      res.status(STATUS.OK).json({
        success: true,
        messaege: "Get booking history successfully",
        history,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ messaege: "Server Error" });
    }
  }

  static async checkIn(req, res) {
    try {
      // console.log("Check in: ", req.body)
      const bookingId = req.params.id;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: true },
      });
      if (!booking) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Check-int not found" });
      }
      if (booking.status === "CHECKED_IN") {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Booking is already checked in",
        });
      }
      if (booking.status !== "PAID") {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Booking is not paid yet" });
      }
      if (booking.property.status === "FULL") {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Room is already occupied" });
      }

      const [updatedBooking, updatedProperty] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CHECKED_IN",
          },
        }),

        prisma.property.update({
          where: { id: booking.propertyId },
          data: {
            status: "FULL",
          },
        }),
      ]);

      res.status(STATUS.OK).json({
        success: true,
        message: "Check-in successful",
        data: { updatedBooking, updatedProperty },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ messaege: "Server Error" });
    }
  }

  static async checkOut(req, res) {
    try {
      const bookingId = req.params.id;
      // Validate booking ID
      if (!bookingId) {
        return res
          .status(400)
          .json({ success: false, message: "Booking ID is required" });
      }

      // Find booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      // Prevent double check-out
      if (booking.status === "CHECKED_OUT") {
        return res
          .status(400)
          .json({ success: false, message: "Already checked out" });
      }
      // Check booking status
      if (booking.status !== "CHECKED_IN") {
        return res.status(STATUS.BAD_REQUEST).json({
          success: false,
          message: "Cannot check out before check-in",
        });
      }

      // Update booking
      const [updatedBooking] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "CHECKED_OUT",
          },
          include: {
            property: true,
            payment: true,
          },
        }),
        prisma.property.update({
          where: { id: booking.propertyId },
          data: { status: "AVAILABLE" },
        }),
      ]);

      res.status(200).json({
        success: true,
        message: "Checked out successfully",
        updatedBooking,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ messaege: "Server error" });
    }
  }
}
