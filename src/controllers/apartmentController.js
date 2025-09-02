import STATUS from "../service/statusCodes.js";
import { PrismaClient } from "@prisma/client";
import CloudinaryService from "../service/cloudinarySerice.js";

export default class apartmentController {
  constructor() {
    // Middleware
    // this.uploadSingle = CloudinaryService.singleUpload("image");
    this.upload = CloudinaryService.multipleUpload("images", 5);

    // Cloudinary instance for manual upload if needed
    this.cloudinary = CloudinaryService.cloudinary;
  }

  // Upload single imaeg to Cloudinary
  uploadImages = async (req, res) => {
    try {
      console.log("File info:", req.files); // Log file info for debugging
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      //Upload to Cloudinary
      // const image = await this.cloudinary.uploader.upload(req.file.path, {
      //   folder: "apartments",
      // });
      const urls = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      // Respond with the Cloudinary URL and public ID

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Image uploaded successfully",
        data: urls,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  };

  //create apartment method
  static async createApartment(req, res) {
    try {
      //code
      const {
        title,
        description,
        address,
        images,
        price,
        priceBooking,
        apartmentType,
        badRoom,
        convenience,
        otherService,
        categoryId,
      } = req.body;

      //Validate input
      if (!title)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Title is required" });
      if (!description)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Description is required" });
      if (!address)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Address is required" });
      // if(!images || images.length === 0) return res.status(STATUS.BAD_REQUEST).json({message: "At least one image is required"});
      if (!price)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Price is required" });
      if (!priceBooking)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Price Booking is required" });
      if (!apartmentType)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Apartment Type is required" });
      if (!categoryId)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "CategoryId is required" });
      // if (!convenience)
      //   return res
      //     .status(STATUS.BAD_REQUEST)
      //     .json({ message: "Convenience is required" });
      // if (!otherService)
      //   return res
      //     .status(STATUS.BAD_REQUEST)
      //     .json({ message: "Other Service is required" });

      const prisma = new PrismaClient();
      //Create apartment
      const apartment = await prisma.apartment.create({
        data: {
          title,
          description,
          address: {
            create: {
              village: address.village,
              district: address.district,
              province: address.province,
            },
          },
          price: parseFloat(price),
          priceBooking: parseFloat(priceBooking),
          apartmentType,
          badRoom,
          convenience,
          otherService,
          categoryId: parseInt(categoryId),
        },
      });

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Apartment created successfully",
        data: apartment,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  // select all apartments method
  static async getAllApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const allApartments = await prisma.apartment.findMany({
        include: {
          address: true,
          images: true,
        },
      });

      res.status(STATUS.OK).json({
        success: true,
        message: "Get all apartments successfully",
        data: allApartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Select one apartment method
  static async getOneApartment(req, res) {
    try {
      const apartmentId = req.params.Id;
      const prisma = new PrismaClient();
      const oneApartment = await prisma.apartment.findFirst({
        where: { id: Number(apartmentId) },
        include: {
          address: true,
          images: true,
        },
      });
      if (!oneApartment) {
        return res.status(STATUS.NOT_FOUND).json({
          success: false,
          message: "A apartment not found",
          data: null,
        });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get one apartment successfully",
        data: { oneApartment },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Update apartment method
  static async updateApartment(req, res) {
    try {
      const apartmentId = req.params.id;
      //Validate input
      const {
        title,
        description,
        address,
        images,
        price,
        priceBooking,
        apartmentType,
        badRoom,
        convenience,
        otherService,
      } = req.body;

      const prisma = new PrismaClient();
      //Delete address
      await prisma.address.deleteMany({
        where: { apartmentId: Number(apartmentId) },
      });

      //Update apartment
      const updateApartment = await prisma.apartment.update({
        where: { id: Number(apartmentId) },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          address: {
            create: {
              village: address.village,
              district: address.district,
              province: address.province,
            },
          },
          ...(price !== undefined ? { price: parseFloat(price) } : {}),
          ...(priceBooking !== undefined
            ? { priceBooking: parseFloat(priceBooking) }
            : {}),
          ...(apartmentType !== undefined ? { apartmentType } : {}),
          ...(badRoom !== undefined ? { badRoom } : {}),
          ...(convenience !== undefined ? { convenience } : {}),
          ...(otherService !== undefined ? { otherService } : {}),
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Update apartment successfully",
        data: { updateApartment },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Delete apartment method
  static async deleteApartment(req, res) {
    try {
      const apartmentId = req.params.id;
      const prisma = new PrismaClient();
      const apartment = await prisma.apartment.findFirst({
        where: { id: Number(apartmentId) },
        include: {
          address: true,
        },
      });
      if (!apartment) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No apartment to delete" });
      }
      const remove = await prisma.apartment.delete({
        where: { id: Number(apartmentId) },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Delete apartment successfully",
        data: { remove },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search apartments by price method
  static async searchByPrice(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;
      const prisma = new PrismaClient();

      const apartments = await prisma.apartment.findMany({
        where: {
          AND: [
            minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
            maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
          ],
        },
        orderBy: { price: "asc" }, // เรียงจากราคาต่ำไปสูง
      });

      res.status(STATUS.OK).json({
        success: true,
        message: "Search apartments successfully",
        data: { apartments },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search apartments by location method
  static async searchByLocation(req, res) {
    try {
      const { village, district, province } = req.query;
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: {
          address: {
            some: {
              village: village ? { contains: village } : undefined,
              district: district ? { contains: district } : undefined,
              province: province ? { contains: province } : undefined,
            },
          },
        },
        include: {
          address: true,
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Search apartment by price successfully",
        data: { apartments },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search apartments by Category method
  static async searchByCategory(req, res) {
    try {
      const category = req.query.category;
      // console.log("Category:", category); // Debug log
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { category: { name: category } },
        include: {
          address: true,
          images: true,
          category: true,
        },
      });
      if (apartments.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No apartment in this category" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Search apartment by category successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all booked apartments method
  static async getBookedApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { bookings: { some: { status: "confirmed" } } },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No booked apartment" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get booked apartments successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all paid apartment method
  static async getPaidAparments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { paymentStatus: "paid" },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No paid apartment" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all paid apartment successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all full apartments method
  static async getFullApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { status: "full" },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No full apartment" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all full apartments successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all available apartments method
  static async getAvailableApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { status: "available" },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No available apartment" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all available apartments successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all unpaid apartments method
  static async getUnpaidApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { paymentStatus: "unpaid" },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No unpaid apartment" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all unpaid apartment successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all deposit apartments method
  static async getDepositApartments(req, res) {
    try {
      const prisma = new PrismaClient();
      const apartments = await prisma.apartment.findMany({
        where: { priceBooking: { gte: 100000 } },
        include: {
          address: true,
          images: true,
        },
      });
      if (apartments.length === 0) {
        res.status(STATUS.NOT_FOUND).json({ message: "No deposit apartment" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all deposit apartments successfully",
        data: apartments,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
