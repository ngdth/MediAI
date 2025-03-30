import express from "express";
import {   authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
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
assignToPharmacy, 
updateAppointmentField,
updateNurseFields,
doctorReject,
} from "../controllers/auth/appointmentController";
const router = express.Router();
// Appointment routes
router.use(authenticateToken)

router.post("/booknodoctor",   createAppointment);
router.get("/pending",   authorizeRole(["doctor", "nurse"]), getPendingAppointments);
router.get("/waiting",   authorizeRole(["doctor", "nurse"]), getWaitingPrescriptionAppointments);
router.get("/prescription-created",   authorizeRole(["doctor"]), getPrescriptionCreatedAppointments);
router.put("/:id/status",   authorizeRole(["doctor", "nurse"]), updateAppointmentStatus);
router.put("/:id/reject",   authorizeRole(["doctor", "nurse"]), doctorReject);
router.put("/:id/assign",   authorizeRole(["doctor", "nurse"]), assignDoctor);
router.put("/:id/diagnosis",   authorizeRole(["doctor", "nurse"]), addDiagnosisAndPrescription);
router.post("/:id/createresult",   createResult);
router.post("/:id/createprescription",   createPrescription);
router.put("/:id/remove-doctor",   authorizeRole(["doctor", "nurse"]), removeDoctorFromAppointment);
router.put("/:id/assign-pharmacy",   authorizeRole(["doctor", "nurse"]), assignToPharmacy);
router.put("/:id/update-field",   authorizeRole(["doctor", "nurse"]), updateAppointmentField);
router.put("/:id/update-nurse-fields",   authorizeRole(["nurse"]), updateNurseFields);
// router.post("/appointment",   authorizeRole(["doctor"]), createAppointment);
// router.put("/appointment/:id",   authorizeRole(["nurse"]), updateAppointmentStatus);
router.post("/book",   bookAppointment);
router.get("/history/:id",   getDetailAppointment );
router.get("/history",   getUserAppointments);
router.get("/:id", getAppointmentById);
router.get("/", viewAllAppointments);
router.delete("/:id/cancel",   cancelAppointment );
export default router;