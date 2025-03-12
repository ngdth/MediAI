import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createAppointment, getPendingAppointments, updateAppointmentStatus, assignDoctor, cancelAppointment, addDiagnosisAndPrescription, getAppointmentById, createResultAndPrescription, getWaitingPrescriptionAppointments, getDetailAppointment, getUserAppointments, viewAllAppointments, bookAppointment } from "../controllers/auth/appointmentController";
const router = express.Router();
// Appointment routes
router.post("/booknodoctor", authenticateToken, createAppointment);
router.get("/pending", authenticateToken, authorizeRole(["doctor", "nurse"]), getPendingAppointments);
router.get("/waiting", authenticateToken, authorizeRole(["doctor", "nurse"]), getWaitingPrescriptionAppointments);
router.put("/:id/status", authenticateToken, authorizeRole(["doctor", "nurse"]), updateAppointmentStatus);
router.put("/:id/assign", authenticateToken, authorizeRole(["doctor", "nurse"]), assignDoctor);
router.put("/:id/diagnosis", authenticateToken, authorizeRole(["doctor", "nurse"]), addDiagnosisAndPrescription);
router.get("/:id", getAppointmentById);
router.post("/:id/result-and-prescription", createResultAndPrescription);

// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
// router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book",authenticateToken,authorizeRole(["user", "doctor", "nurse"]), bookAppointment);
router.get("/history/:id", authenticateToken,getDetailAppointment );
router.get("/history", authenticateToken, getUserAppointments);
router.get("/",authenticateToken,authorizeRole(["doctor", "nurse"]), viewAllAppointments);
router.delete("/:id/cancel", authenticateToken,cancelAppointment );
export default router;