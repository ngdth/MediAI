import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { bookAppointment, cancelAppointment, getDetailAppointment, getUserAppointments, updateAppointmentStatus, viewAllAppointments } from "../controllers/auth/appointmentController.ts";
const router = express.Router();
// Appointment routes

// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book",authenticateToken, bookAppointment);
router.get("/history/:id", authenticateToken,getDetailAppointment );
router.get("/history", authenticateToken, getUserAppointments);
router.get("/",authenticateToken, viewAllAppointments);
router.delete("/:id/cancel", authenticateToken,cancelAppointment );
export default router;