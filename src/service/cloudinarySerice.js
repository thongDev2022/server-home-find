// src/services/cloudinaryService.js
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import multer from "multer";

dotenv.config();

class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.cloudinary = cloudinary;

    // Configure Multer storage for Cloudinary
    // this.storage = new CloudinaryStorage({
    //   cloudinary: this.cloudinary,
    //   params: {
    //     folder: "apartments",
    //     allowed_formats: ["jpg", "png", "jpeg"],
    //   },
    // });

    // this.upload = multer({ storage: this.storage });
  }

  // Single upload middleware
  // singleUpload(fieldName = "image") {
  //   return this.upload.single(fieldName);
  // }

  // Multiple upload middleware
  // multipleUpload(fieldName = "images", maxCount = 4) {
  //   return this.upload.array(fieldName, maxCount);
  // }
}

export default new CloudinaryService();
