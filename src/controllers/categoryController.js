import STATUS from "../service/statusCodes.js";
import { PrismaClient } from "@prisma/client";

export default class categoryController {
  //Create category method
  static async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      //Validate input
      if (!name)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Name is required" });
      if (!description)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Description is requird" });

      const prisma = new PrismaClient();
      const category = await prisma.category.create({
        data: {
          name,
          description,
        },
      });
      res.status(STATUS.CREATED).json({
        success: true,
        message: "Category created successfully",
        data: { category },
      });
    } catch (err) {
      console.log(err);
      res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: "Sever Error" });
    }
  }

  //Get all category method
  static async getAllCategory(req, res) {
    try {
      const prisma = new PrismaClient();
      const allCategories = await prisma.category.findMany({
        include: {
          apartments: true,
        },
      });
      if (!allCategories)
        return res.status(STATUS.NOT_FOUND).json({
          success: false,
          message: "Category not found",
          data: null,
        });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get all categories successfully",
        data: { allCategories },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Update category method

  static async updateCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const { name, description } = req.body;
      const prisma = new PrismaClient();
      const category = await prisma.category.update({
        where: { id: Number(categoryId) },
        data: {
          ...(name ? { name } : {}),
          ...(description ? { description } : {}),
        },
      });
      res.status(STATUS.CREATED).json({
        success: true,
        message: "Updated category successfully",
        data: { category },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Delete category method
  static async deleteCategory(req, res){
    try{
      const categoryId = req.params.id
      const prisma = new PrismaClient();
      const remove = await prisma.category.delete({
        where : {id : Number(categoryId)}
      })
      res.status(STATUS.OK).json({
        success : true,
        message : "Deleted category successfully",
        data : {remove}
      })
    }catch(err){
      console.log(err);
      if(err.code === "P2025"){
        return res.status(STATUS.NOT_FOUND).json({message : "No category to delete"})
      }
        res.status(STATUS.INTERNAL_SERVER_ERROR).json({message : "Server error"})
    }
  }
}
