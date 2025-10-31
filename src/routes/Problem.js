import express from "express";
import { authCheck } from "../middleware/authCheck.js";
import problem from "../controllers/problemController.js";

const router = express.Router();

router.post("/property/problem", authCheck, problem.reportProblem);
router.get("/property/problems", authCheck, problem.getAllProblems);

export default router