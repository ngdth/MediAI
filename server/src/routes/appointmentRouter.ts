import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { 
getWaitingPrescriptionAppointments,
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
assignToPharmacy, 
} from "../controllers/auth/appointmentController";
const router = express.Router();
// Appointment routes
router.get("/waiting", authenticateToken, authorizeRole(["doctor", "nurse"]), getWaitingPrescriptionAppointments);
router.get("/prescription-created", authenticateToken, authorizeRole(["doctor"]), getPrescriptionCreatedAppointments);
router.get("/:id", getAppointmentById);
router.post("/:id/createresult", authenticateToken, createResult);
router.post("/:id/createprescription", authenticateToken, createPrescription);
router.put("/:id/remove-doctor", authenticateToken, authorizeRole(["doctor", "nurse"]), removeDoctorFromAppointment);
router.put("/:id/assign-pharmacy", authenticateToken, authorizeRole(["doctor", "nurse"]), assignToPharmacy);
// router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
// router.put("/appointment/:id", authenticateToken, authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book", authenticateToken, bookAppointment);
router.get("/history/:id", authenticateToken, getDetailAppointment );
router.get("/history", authenticateToken, getUserAppointments);
router.get("/", viewAllAppointments);
router.delete("/:id/cancel", authenticateToken, cancelAppointment );
export default router;