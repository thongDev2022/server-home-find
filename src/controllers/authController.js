import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import STATUS from "../service/statusCodes.js";

export default class authController {
  //Register method
  static async Register(req, res) {
    try {
      //code
      const { username, email, password, phoneNumber } = req.body;
      //Validate inputs
      if (!username)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Username is required!" });
      if (!email)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Email is required!" });
      if (!password)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Password is required!" });
      if (!phoneNumber)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Phone number is required!" });

      //Check if user already exists
      const prisma = new PrismaClient();
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res
          .status(STATUS.CONFLICT)
          .json({ message: "User already exists!" });
      }

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      if (!hashedPassword) {
        return res
          .status(STATUS.UNPROCESSABLE_ENTITY)
          .json({ message: "Error hashing password!" });
      }
      //Create user in the database
      const user = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          phoneNumber: Number(phoneNumber),
        },
      });
      res.status(STATUS.CREATED).json({
        success: true,
        message: "User registered successfully!",
        data: { user },
      });
    } catch (err) {
      console.log(err);
      res.statusS(STATUS.CREATED).json({ message: "Server Error" });
    }
  }

  //Login method
  static async Login(req, res) {
    try {
      //code
      const { email, password } = req.body;
      //Validate inputs
      if (!email)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Email is required!" });
      if (!password)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Password is required!" });

      //Check if user exists
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "User does not exist!" });
      }

      //Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(STATUS.UNAUTHORIZED)
          .json({ message: "Invalid password!" });
      }

      //Generate JWT token
      const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });
      if (!token) {
        return res
          .status(STATUS.INTERNAL_SERVER_ERROR)
          .json({ message: "Error generating token!" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Login successful!",
        data: {
          payload,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }

  //Current user method
  static async currentUser(req, res) {
    try {
      const prisma = new PrismaClient();
      const user = await prisma.user.findFirst({
        where: { email: req.user.email },
        select: {
          username: true,
          email: true,
          phoneNumber: true,
          role: true,
        },
      });
      if (!user)
        return res.status(STATUS.NOT_FOUND).json({
          success: false,
          message: "User not found",
          data: { user },
        });
      res.status(STATUS.OK).json({
        success: true,
        message: "Get current user successfully",
        data: { user },
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
