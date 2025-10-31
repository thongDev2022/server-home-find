import STATUS from "../service/statusCodes.js";
import prisma from "../service/prismaClient.js";

export default class payment {
  //Create pay
  static async create(req, res) {
    try {
      // console.log(req.body);
      const { bookingId, amount, paymentMethod } = req.body;
      const allowedMethods = ["QR", "CASH", "CARD", "BANK"];

      //Validate input
      if (!bookingId || typeof bookingId !== "string") {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Invalid bookingId" });
      }
      if (typeof amount !== "number" || amount <= 0) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Amount must be a positive number" });
      }
      if (!allowedMethods.includes(paymentMethod)) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Invalid payment method" });
      }

      //Check existing booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Booking not found" });
      }

      //Check booking status
      if (booking.status !== "PENDING") {
        return res.status(STATUS.BAD_REQUEST).json({
          message: `This booking cannot be paid. Current status: ${booking.status}`,
        });
      }

      //Check the amount to match the amount to be paid.
      if (amount !== booking.totalPrice) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Payment amount does not match booking total price",
        });
      }

      //Check existing payment
      const existingPayment = await prisma.payment.findUnique({
        where: { bookingId },
      });

      if (existingPayment) {
        return res
          .status(400)
          .json({ message: "Payment already exists for this booking." });
      }

      //Create payment
      // const payment = await prisma.payment.create({
      //   data: {
      //     bookingId,
      //     amount,
      //     paymentMethod,
      //   },
      // });
      // //Update booking status
      // if (payment) {
      //   await prisma.booking.update({
      //     where: { id: bookingId },
      //     data: { status: "PAID" },
      //   });
      // }
      const [payment, updatedBooking] = await prisma.$transaction([
        prisma.payment.create({
          data: {
            bookingId,
            amount,
            paymentMethod,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "PAID" },
        }),
      ]);

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Created payment successfully",
        data: {
          ...payment,
          formattedAmount: amount.toLocaleString("lo-La", {
            style: "currency",
            currency: "LAK",
          }),
        },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all payments
  static async paymentList(req, res) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          booking: {
            include: {
              property: true,
              user: true,
            },
          },
        },
      });
      if (!payments || payments.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Payments not found" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all payments successfully",
        payments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get payment by id
  static async getPaymentById(req, res) {
    try {
      const paymentId = req.params.id;
      // console.log("paymentId: ",paymentId)
      const payment = await prisma.payment.findFirst({
        where: { id: paymentId },
      });
      if (!payment)
        return res.status(STATUS.NOT_FOUND).json({ message: "No payment" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get payment by id successfully",
        payment,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Update payment
  static async update(req, res) {
    try {
      // const paymentId = req.params.id;
      // console.log("paymentId: ", paymentId)
      const { bookingId, amount, paymentMethod } = req.body;
      //Check payment existing
      const existingPayment = await prisma.payment.findUnique({
        where: { bookingId },
      });

      let payment;
      if (existingPayment) {
        payment = await prisma.payment.update({
          where: { bookingId },
          data: {
            amount,
            paymentMethod,
          },
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            bookingId,
            amount,
            paymentMethod,
          },
        });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Updated payment successfully",
        payment,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Remove payment
  static async remove(req, res) {
    try {
      const paymentId = req.params.id;
      // console.log(paymentId)
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
      if (!existingPayment)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No payment to delete" });
      const payment = await prisma.payment.delete({
        where: { id: paymentId },
      });
      res.status(STATUS.CREATED).json({
        success: true,
        message: "Deleted payment successfully",
        payment,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
