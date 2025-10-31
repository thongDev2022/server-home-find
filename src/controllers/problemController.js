import prisma from "../service/prismaClient.js";
import STATUS from "../service/statusCodes.js";

export default class problem {
  // Report a problem with a property
  static async reportProblem(req, res) {
    try {
      const { propertyNumber, floor, problem, phone, propertyId } = req.body;
      const userId = req.user?.id; // Assuming authentication middleware adds req.user

      //  Validate required fields
      if (!propertyNumber)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Property number is required" });
      if (!floor)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Floor is required" });
      if (!problem)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Problem description is required" });
      if (!phone)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Phone number is required" });
      if (!userId)
        return res
          .status(STATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      if (!propertyId)
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Property ID is required" });

      //Check property existing
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "Property not found" });

      //  Create a new problem report
      const report = await prisma.problem.create({
        data: {
          propertyNumber,
          floor,
          problem,
          phone,
          user: { connect: { id: userId } },
          property: { connect: { id: propertyId } },
        },
      });

      return res.status(STATUS.CREATED).json({
        success: true,
        message: "Reported problem successfully",
        report,
      });
    } catch (err) {
      console.error("Error reporting problem:", err);
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  // Get all reported problems (admin only)
  static async getAllProblems(req, res) {
    try {
      const problems = await prisma.problem.findMany({
        include: {
          property: true,
          user: true,
        },
      });

      //Check problems existing
      if (!problems || problems.length === 0)
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: "No problems found" });

      res.status(STATUS.OK).json({
        success: true,
        message: "Get all problems successfully",
        problems,
      });
    } catch (err) {
      console.log(err);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error" });
    }
  }
}
