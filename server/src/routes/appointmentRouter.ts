import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { 
createAppointment, 
getPendingAppointments, 
getWaitingPrescriptionAppointments,
updateAppointmentStatus, 
assignDoctor, 
addDiagnosisAndPrescription, 
getAppointmentById, 
createResult, 
createPrescription,
getPrescriptionCreatedAppointments,
bookAppointment, 
getDetailAppointment, 
getUserAppointments, 
viewAllAppointments, 
cancelAppointment, 
removeDoctorFromAppointment, 
} from "../controllers/auth/appointmentController";
const router = express.Router();
// Appointment routes
router.post("/booknodoctor", authenticateToken, createAppointment);
router.get("/pending", authenticateToken, authorizeRole(["doctor", "nurse"]), getPendingAppointments);
router.get("/waiting", authenticateToken, authorizeRole(["doctor", "nurse"]), getWaitingPrescriptionAppointments);
router.get("/prescription-created", authenticateToken, authorizeRole(["doctor"]), getPrescriptionCreatedAppointments);
router.put("/:id/status", authenticateToken, authorizeRole(["doctor", "nurse"]), updateAppointmentStatus);
router.put("/:id/assign", authenticateToken, authorizeRole(["doctor", "nurse"]), assignDoctor);
router.put("/:id/diagnosis", authenticateToken, authorizeRole(["doctor", "nurse"]), addDiagnosisAndPrescription);
router.get("/:id", getAppointmentById);
router.post("/:id/createresult", createResult);
router.post("/:id/createprescription", createPrescription);
router.put("/:id/remove-doctor", authenticateToken, authorizeRole(["doctor", "nurse"]), removeDoctorFromAppointment);

// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
// router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book", authenticateToken, bookAppointment);
router.get("/history/:id", authenticateToken, getDetailAppointment );
router.get("/history", authenticateToken, getUserAppointments);
router.get("/", viewAllAppointments);
router.delete("/:id/cancel", authenticateToken, cancelAppointment );
export default router;