import STATUS from "../service/statusCodes.js";
import prisma from "../service/prismaClient.js";
// import { PrismaClient } from "@prisma/client";

export default class userController {
  //Select all user method
  static async getAllUsers(req, res) {
    try {
      // const prisma = new PrismaClient();
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      });
      if (!users || users.length === 0) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No users found!" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Selected All Users Successfully",
        users,
      });
      //   res.send("Hello get all user");
    } catch (err) {
      console.log(err);
      res.status(STATUS).json({ message: "Server Error" });
    }
  }

  // Select one user method
  static async getOneUser(req, res) {
    try {
      //code
      const user_id = req.params.id;
      const user = await prisma.user.findFirst({
        where: {
          id: user_id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        res.status(STATUS.NOT_FOUND).json({ message: "no user found" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Selected One User Successfully",
        user,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Update profile method
  static async updateProfile(req, res) {
    try {
      //code
      const email = req.user.email;
      const { newUsername, newPhoneNumber, newProfile } = req.body;
      // console.log(email);

      const prisma = new PrismaClient();
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!existingUser) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No user can not update profile" });
      }
      const userProfile = await prisma.user.update({
        where: { email },
        data: {
          ...(newUsername !== undefined ? { username: newUsername } : {}),
          ...(newPhoneNumber !== undefined
            ? { phoneNumber: parseInt(newPhoneNumber) }
            : {}),
          ...(newProfile !== undefined ? { profile: newProfile } : {}),
        },
      });
      res.status(STATUS.CREATED).json({
        success: true,
        message: "User profile updated successfully",
        data: { userProfile },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Delete user method
  static async deleteUser(req, res) {
    try {
      //code
      const user_id = req.params.id;
      const existingUser = await prisma.user.findUnique({
        where: { user_id },
      });
      if (!existingUser) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No user to delete" });
      }
      const remove = await prisma.user.delete({
        where: { user_id },
      });
      res.status(STATUS.OK).json({
        success: true,
        message: "Deleted user successfully",
        data: { remove },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //forget user password method
  static async forgetPassword(req, res) {
    try {
      //code
      const { email, newPassword } = req.body;
      console.log(email);
      console.log(newPassword);
      res.send("Hello forget password method");
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Get all tenant
  static async getAllTenants(req, res) {
    try {
      const tenants = await prisma.user.findMany({
        where: { role: "TENANT" },
        include: {
          bookings: {
            include: {
              property: true,
            },
          },
        },
      });

      res.status(STATUS.OK).json({
        success: true,
        message: "Get all tenants successfully",
        tenants,
      });
    } catch (err) {
      console.error(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Server Error" });
    }
  }
}
