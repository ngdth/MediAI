import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createAppointment } from "../controllers/auth/authAppointment";
const router = express.Router();
// Appointment routes

router.post("/appointment", authenticateToken, authorizeRole(["doctor"]), createAppointment);
    
export default router;