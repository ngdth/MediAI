import express from "express";
import { getDoctorById, getDoctorBlogs } from "../controllers/doctor/doctorController";

const router = express.Router();

router.get("/:id", getDoctorById);
router.get("/:id/blogs", getDoctorBlogs);

export default router;
