import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createAppointment, getPendingAppointments, updateAppointmentStatus, assignDoctor, cancelAppointment, addDiagnosisAndPrescription, getAppointmentById, getDetailAppointment, getUserAppointments, viewAllAppointments } from "../controllers/auth/appointmentController";
const router = express.Router();
// Appointment routes
router.post("/book", authenticateToken, createAppointment);
router.get("/pending", authenticateToken, authorizeRole(["nurse"]), getPendingAppointments);
router.put("/:id/status", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.put("/:id/assign", authenticateToken, authorizeRole(["nurse"]), assignDoctor);
router.put("/:id/diagnosis", authenticateToken, authorizeRole(["doctor"]), addDiagnosisAndPrescription);
router.get("/:id", getAppointmentById);
// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
// router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
// router.post("/book",authenticateToken, bookAppointment);
router.get("/history/:id", authenticateToken,getDetailAppointment );
router.get("/history", authenticateToken, getUserAppointments);
router.get("/",authenticateToken, viewAllAppointments);
router.delete("/:id/cancel", authenticateToken,cancelAppointment );
export default router;