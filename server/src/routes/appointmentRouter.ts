import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { bookAppointment, updateAppointmentStatus } from "../controllers/auth/appointmentController.ts";
const router = express.Router();
// Appointment routes

// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book",authenticateToken, bookAppointment);
export default router;