// src/routes/scheduleRoutes.ts
import express from 'express';
import { createSchedule, getAllSchedules, getSchedulesByDoctor,  } from '../controllers/schedule/scheduleController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/create",authenticateToken, createSchedule, authorizeRole(['doctor'])); // Create schedule
router.get("/schedule/:doctorId",authenticateToken, getSchedulesByDoctor ); // View doctor schedule
router.get("/schedules",authenticateToken, getAllSchedules ); // View all schedules
export default router;
