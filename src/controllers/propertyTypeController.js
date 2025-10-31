import STATUS from "../service/statusCodes.js";
import prisma from "../service/prismaClient.js";

export default class propertyType {
  //Create property type
  static async createPropertyType(req, res) {
    try {
      //   console.log(req.body);
      const { name, description } = req.body;
      //Validate input
      if (!name || typeof name !== "string")
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Name is required and must be a string" });
      if (!description || typeof description !== "string")
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "description is required and must be a string" });

      //Add data
      const propertyType = await prisma.propertyType.create({
        data: {
          name,
          description,
        },
      });

      res.status(STATUS.CREATED).json({
        success: true,
        message: "Created propertyType successfully",
        propertyType,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all property type
  static async getAllPropertyType(req, res) {
    try {
      const propertyTypes = await prisma.propertyType.findMany();
      if (!propertyTypes) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Proprty not found" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all property type successfully",
        propertyTypes,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
