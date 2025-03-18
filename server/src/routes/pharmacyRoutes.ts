import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createBill, getDoneAppointments } from "../controllers/auth/pharmacyController";

const router = express.Router();

router.get("appointments/done", authenticateToken, authorizeRole(["pharmacy"]), getDoneAppointments);

router.post("/create", createBill);

export default router;