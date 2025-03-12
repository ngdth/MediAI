// src/routes/scheduleRoutes.ts
import express from 'express';
import { createSchedule, deleteSchedule, getAllSchedules, getSchedulesByDoctor, updateSchedule,  } from '../controllers/schedule/scheduleController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/create",authenticateToken, createSchedule, authorizeRole(['doctor'])); // Create schedule
router.get("/schedule/:doctorId",authenticateToken, getSchedulesByDoctor ); // View doctor schedule
router.get("/schedules",authenticateToken, getAllSchedules ); // View all schedules
// create router for update schedule and delete schedule
router.put("/update/:scheduleId",authenticateToken, updateSchedule, authorizeRole(['doctor'])); // Update schedule
router.delete("/delete/:scheduleId",authenticateToken, deleteSchedule, authorizeRole(['doctor'])); // Delete schedule
export default router;
