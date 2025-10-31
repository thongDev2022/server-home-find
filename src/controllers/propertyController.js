import STATUS from "../service/statusCodes.js";
import prisma from "../service/prismaClient.js";
import cloudinarySerice from "../service/cloudinarySerice.js";
import { v2 as cloudinary } from "cloudinary";
import payment from "./paymentController.js";

export default class property {
  constructor() {
    this.cloudinary = cloudinarySerice.cloudinary;
  }
  //Validate input
  static validateInput(data) {
    const errors = [];

    // Required fields
    if (!data.prefix || typeof data.prefix !== "string")
      errors.push("prefix is required and must be a string");
    if (data.startNumber === undefined || typeof data.startNumber !== "number")
      errors.push("startNumber is required and must be a number");
    if (data.endNumber === undefined || typeof data.endNumber !== "number")
      errors.push("endNumber is required and must be a number");
    if (!data.rentPrice || typeof data.rentPrice !== "number")
      errors.push("rentPrice is required and must be a number");
    if (!data.deposit || typeof data.deposit !== "number")
      errors.push("deposit is required and must be a number");
    if (!data.propertyTypeId || typeof data.propertyTypeId !== "string")
      errors.push("propertyTypeId is required");
    if (!data.location || typeof data.location !== "string")
      errors.push("location is required");
    if (!data.address || typeof data.address !== "object")
      errors.push("address is required and must be an object");
    if (!data.priceType || typeof data.priceType !== "string")
      errors.push("priceType is required");
    if (!data.price || typeof data.price !== "number")
      errors.push("price is required and must be a number");
    // if (!data.ownerId || typeof data.ownerId !== "string") errors.push("ownerId is required");

    // Optional fields validation
    // if (data.size && typeof data.size !== "string") errors.push("size must be a string");
    // if (data.floor && typeof data.floor !== "number") errors.push("floor must be a number");
    // if (data.details && typeof data.details !== "string") errors.push("details must be a string");
    // if (data.description && typeof data.description !== "string") errors.push("description must be a string");

    // Images array validation
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((img, index) => {
        if (!img.url || typeof img.url !== "string")
          errors.push(`images[${index}].url is required`);
        if (img.description && typeof img.description !== "string")
          errors.push(`images[${index}].description must be a string`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  //Create property
  static async createProperty(req, res) {
    try {
      // console.log("Form data: ", req.body);
      //Validate input
      // const { isValid, errors } = property.validateInput(req.body);
      // if (!isValid) {
      //   const errorMessages = Array.isArray(errors)
      //     ? errors
      //     : Object.values(errors); // convert object to array of messages

      //   return res.status(STATUS.BAD_REQUEST).json({ messages: errorMessages });
      // }
      // console.log("property: ", req.body);
      const ownerId = req.user.id;
      const {
        prefix,
        startNumber,
        endNumber,
        rentPrice,
        deposit,
        size,
        floor,
        details,
        propertyTypeId,
        images,
        image,
        location,
        village,
        district,
        province,
        priceType,
        moreDetails,
      } = req.body;
      // Validate required fields
      // if (
      //   !startNumber ||
      //   !endNumber ||
      //   isNaN(parseInt(startNumber)) ||
      //   isNaN(parseInt(endNumber))
      // )
      //   return res
      //     .status(400)
      //     .json({ message: "StartNumber and EndNumber must be valid numbers" });
      if (!rentPrice || isNaN(parseFloat(rentPrice)))
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "RentPrice must be a valid number" });
      if (!deposit || isNaN(parseFloat(deposit)))
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Deposit must be a valid number" });
      if (!propertyTypeId)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Property type is required" });
      if (!images || !Array.isArray(images) || images.length === 0)
        return res
          .status(400)
          .json({ message: "At least one image is required" });
      if (!image)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Main image is required" });

      //Check end number existing
      // const existingNumber = await prisma.property.findUnique({
      //   where: { endNumber:Number(endNumber) },
      // });
      // if (existingNumber) {
      //   return res
      //     .status(STATUS.BAD_REQUEST)
      //     .json({ message: "endNumber is existing" });
      // }
      //Create a property
      const property = await prisma.property.create({
        data: {
          prefix,
          startNumber: parseInt(startNumber),
          endNumber: parseInt(endNumber),
          rentPrice: parseFloat(rentPrice),
          deposit: parseFloat(deposit),
          size,
          floor: parseInt(floor),
          details: details?.trim(),
          propertyType: { connect: { id: propertyTypeId } },
          images: {
            create: images.map((item) => ({
              asset_id: item.asset_id,
              url: item.url,
              public_id: item.public_id,
              format: item.format,
            })),
          },
          image: {
            asset_id: image.asset_id,
            public_id: image.public_id,
            url: image.url,
            format: image.format,
          },
          location,
          address: {
            create: {
              village: village?.trim(),
              district: district?.trim(),
              province: province?.trim(),
            },
          },
          priceType,
          moreDetails: moreDetails?.trim(),
          owner: { connect: { id: ownerId } },
        },
      });

      res.status(201).json({
        success: true,
        message: "Created property successfully",
        property,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all properties
  static async propertyLists(req, res) {
    try {
      const properties = await prisma.property.findMany({
        include: {
          images: true,
          address: true,
          bookings: true,
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all properties succesffuly",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get property by ID
  static async getPropertyById(req, res) {
    try {
      const propertyId = req.params.id;
      const property = await prisma.property.findFirst({
        where: { id: propertyId },
        include: {
          images: true,
          address: true,
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get one property succesfully",
        property,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Update property
  static async updateProperty(req, res) {
    try {
      const propertyId = req.params.id;
      const {
        prefix,
        startNumber,
        endNumber,
        rentPrice,
        deposit,
        size,
        floor,
        details,
        propertyTypeId,
        images,
        location,
        address,
        priceType,
        price,
        description,
        ownerId,
      } = req.body;

      // Check if property exists and belongs to owner
      const existingProperty = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Property not found" });
      }

      //Update property
      const property = await prisma.property.update({
        where: { id: propertyId },
        data: {
          ...(prefix && { prefix }),
          ...(startNumber && { startNumber: Number(startNumber) }),
          ...(endNumber && { endNumber: Number(endNumber) }),
          ...(rentPrice && { rentPrice: Number(rentPrice) }),
          ...(deposit && { deposit: Number(deposit) }),
          ...(size && { size }),
          ...(floor && { floor: Number(floor) }),
          ...(details && { details }),
          ...(propertyTypeId && { propertyTypeId }),

          ...(images
            ? {
                images: {
                  deleteMany: {}, // remove old
                  create: images.map((img) => ({
                    asset_id: img.asset_id,
                    url: img.url,
                    public_id: img.public_id,
                    format: img.format,
                  })),
                },
              }
            : {}),

          ...(location && { location }),

          ...(address
            ? {
                address: {
                  upsert: {
                    create: {
                      village: address.village,
                      district: address.district,
                      province: address.province,
                    },
                    update: {
                      village: address.village,
                      district: address.district,
                      province: address.province,
                    },
                  },
                },
              }
            : {}),

          ...(priceType && { priceType }),
          ...(price && { price: Number(price) }),
          ...(description && { description }),

          ...(ownerId && { owner: { connect: { id: ownerId } } }),
        },
      });

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Updated property successfully",
        property,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Delete property
  static async removeProperty(req, res) {
    try {
      const propertyId = req.params.id;
      //Check existing property
      const existingProperty = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Property not found" });
      }
      //Delete property
      const property = await prisma.property.delete({
        where: { id: propertyId },
        include: {
          images: true,
          address: true,
        },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Delete property successfully",
        property,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Upload single image
  uploadImage = async (req, res) => {
    try {
      // console.log("File info:", req.body.image); // Log file info for debugging
      const image = req.body.image;
      // console.log("type of variable: ", typeof image);
      if (!image) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No file uploaded" });
      }
      //Upload to Cloudinary
      const url = await this.cloudinary.uploader.upload(image, {
        public_id: `thong-${Date.now()}`,
        resource_type: "auto",
        folder: "properties",
      });

      // const urls = images.map((file) => ({
      //   url: file.path,
      //   public_id: file.filename,
      // }));

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Image uploaded successfully",
        url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  };

  //Upload multiple images
  uploadImages = async (req, res) => {
    try {
      const images = req.body.images;
      // console.log("type:", typeof images);

      if (!images || images.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const urls = await this.cloudinary.uploader.upload(images, {
        public_id: `thong-${Date.now()}`,
        resource_type: "auto",
        folder: "properties",
      });

      res.status(201).json({
        success: true,
        message: "Images uploaded successfully",
        urls,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  };

  //Remove image
  removeImage = async (req, res) => {
    try {
      //code
      const { public_id } = req.body;
      if (!public_id) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "public_id is required" });
      }

      const image = await cloudinary.uploader.destroy(public_id);
      if (image.result === "ok") {
        res.status(STATUS.OK).json({ message: "Image remove successfully" });
      } else {
        res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Image not found or already deleted" });
      }
    } catch (err) {
      //err
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  };

  //Get all booked properties method
  static async getBookedProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: { status: "BOOKED" },
        include: {
          address: true,
          images: true,
        },
      });
      if (properties.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No booked property" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get booked properties successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all paid properties method
  static async getPaidProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: {
          bookings: {
            some: { payments: { is: { status: "SUCCESS" } } },
          },
        },
        include: {
          address: true,
          images: true,
        },
      });
      if (!properties || properties.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No paid property" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all paid properties successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all full properties method
  static async getFullProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: { status: "FULL" },
        include: {
          address: true,
          images: true,
        },
      });
      if (properties.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No full property" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all full properties successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all available properties method
  static async getAvailableProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: { status: "AVAILABLE" },
        include: {
          address: true,
          images: true,
        },
      });
      if (properties.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No available property" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all available properties successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all unpaid properties
  static async getUnpaidProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: {
          bookings: {
            some: {
              payments: {
                is: { status: "PENDING" },
              },
            },
          },
        },
        include: {
          address: true,
          images: true,
        },
      });

      if (!properties || properties.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No unpaid property" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all unpaid apartment successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all deposit properties method
  static async getDepositProperties(req, res) {
    try {
      const properties = await prisma.property.findMany({
        where: { deposit: { gte: parseFloat(300000) } },
        include: {
          address: true,
          images: true,
        },
      });
      if (properties.length === 0) {
        res.status(STATUS.NOT_FOUND).json({ message: "No deposit property" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all deposit property successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search properties by price method
  static async searchByPrice(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;

      const properties = await prisma.property.findMany({
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
        message: "Search properties by price successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search properties by location method
  static async searchByLocation(req, res) {
    try {
      const { village, district, province } = req.query;
      const properties = await prisma.property.findMany({
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
        message: "Search property by price successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Search property by propertyType method
  static async searchByPropertyType(req, res) {
    try {
      const propertyType = req.query.propertyType;
      // console.log("Category:", category); // Debug log
      const properties = await prisma.property.findMany({
        where: { propertyType: { name: propertyType } },
        include: {
          address: true,
          images: true,
          category: true,
        },
      });
      if (properties.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No property in this category" });
      res.status(STATUS.OK).json({
        success: true,
        message: "Search property by propertyType successfully",
        properties,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Report problem
  // static async reportProblem(req, res) {
  //   try {
  //     const { propertyNumber, floor, problem, phone, propertyId } = req.body;
  //     const userId = req.user?.id; // Assuming authentication middleware adds req.user

  //     //  Validate required fields
  //     if (!propertyNumber)
  //       return res
  //         .status(STATUS.BAD_REQUEST)
  //         .json({ message: "Property number is required" });
  //     if (!floor)
  //       return res
  //         .status(STATUS.BAD_REQUEST)
  //         .json({ message: "Floor is required" });
  //     if (!problem)
  //       return res
  //         .status(STATUS.BAD_REQUEST)
  //         .json({ message: "Problem description is required" });
  //     if (!phone)
  //       return res
  //         .status(STATUS.BAD_REQUEST)
  //         .json({ message: "Phone number is required" });
  //     if (!userId)
  //       return res
  //         .status(STATUS.UNAUTHORIZED)
  //         .json({ message: "User not authenticated" });
  //     if (!propertyId)
  //       return res
  //         .status(STATUS.BAD_REQUEST)
  //         .json({ message: "Property ID is required" });

  //     //Check property existing
  //     const property = await prisma.property.findUnique({
  //       where: { id: propertyId },
  //     });
  //     if (!property)
  //       return res
  //         .status(STATUS.NOT_FOUND)
  //         .json({ message: "Property not found" });

  //     //  Create a new problem report
  //     const report = await prisma.problem.create({
  //       data: {
  //         propertyNumber,
  //         floor,
  //         problem,
  //         phone,
  //         user: { connect: { id: userId } },
  //         property: { connect: { id: propertyId } },
  //       },
  //     });

  //     return res.status(201).json({
  //       success: true,
  //       message: "Reported problem successfully",
  //       report,
  //     });
  //   } catch (err) {
  //     console.error("Error reporting problem:", err);
  //     return res.status(500).json({ message: "Server error" });
  //   }
  // }

  //Get all problems
  // static async getAllProblems(req, res) {
    
  // }
}
