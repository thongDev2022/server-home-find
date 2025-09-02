import jwt from "jsonwebtoken";
import STATUS from "../service/statusCodes.js";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: "No token provided" });
    }
    const token = headerToken.split(" ")[1];
    if (!token) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("decoded: ",req.user)
    next();
  } catch (err) {
    console.log(err);
    res.status(STATUS.FORBIDDEN).json({ message: "Invalid token'" });
  }
};

export const adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user;
    // const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user || user.role !== "admin") {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ message: "Only admin can do this process" });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
  }
};

export const ownerCheck = async(req, res, next) => {
  try{
    const email = req.user.email;
    const user = await prisma.user.findFirst({
      where : {email}
    })
    if(!user || user.role !== "owner"){
      return res.status(STATUS.FORBIDDEN).json({message : "Only owner can do this process"});
    }
    next()
  }catch(err){
    console.log(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({message : "Server Error"});
  }
}