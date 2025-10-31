import prisma from "../service/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import STATUS from "../service/statusCodes.js";

export default class authController {
  //Register method
  static async Register(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      // Validate inputs
      if (!name?.trim())
        return res.status(400).json({ message: "Name is required!" });
      if (!email?.trim())
        return res.status(400).json({ message: "Email is required!" });
      if (!phone?.trim())
        return res.status(400).json({ message: "Phone number is required!" });
      if (!password)
        return res.status(400).json({ message: "Password is required!" });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return res.status(400).json({ message: "Invalid email format!" });

      // Password validation
      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long!" });

      // Check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser)
        return res.status(409).json({ message: "User already exists!" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          phone: phone.trim(),
          password: hashedPassword,
        },
      });

      // Hide password in response
      const { password: _, ...safeUser } = user;

      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        user: safeUser,
      });
    } catch (err) {
      console.error("Register Error:", err);
      if (err.code === "P2002") {
        return res.status(409).json({ message: "Email already exists!" });
      }
      res.status(500).json({ message: "Server Error" });
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });
      if (!token) {
        return res
          .status(STATUS.INTERNAL_SERVER_ERROR)
          .json({ message: "Error generating token!" });
      }
      res.status(STATUS.OK).json({
        success: true,
        message: "Login successful!",
        data: payload,
        token,
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
      const user = await prisma.user.findFirst({
        where: { email: req.user.email },
        select: {
          name: true,
          email: true,
          phone: true,
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
        data: user,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
