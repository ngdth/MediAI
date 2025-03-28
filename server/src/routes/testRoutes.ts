import express from "express";
import { authenticateToken, authorizeDoctor, authorizeRole } from "../middlewares/authMiddleware";
import upload from "../middlewares/imgUpload";
import { uploadTestImages } from "../controllers/Test/testController";

const router = express.Router();

//upload test images
router.post("/upload/:appointmentId/:testType", upload.array("testImages", 5), uploadTestImages);

export default router;
