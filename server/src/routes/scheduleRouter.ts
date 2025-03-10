// src/routes/scheduleRoutes.ts
import express from 'express';
import { createSchedule, getAllSchedules, getSchedulesByDoctor, getSchedulesByToken, upsertSchedule,  } from '../controllers/schedule/scheduleController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/create",authenticateToken, authorizeRole(['doctor']), createSchedule); // Create schedule

router.get("/schedules/:doctorId",authenticateToken, getSchedulesByDoctor ); // View doctor schedule

router.get("/schedules",authenticateToken, getAllSchedules ); // View all schedules

router.post("/upsert",authenticateToken, authorizeRole(['doctor']), upsertSchedule ); // Manage schedule

router.get("/schedules/doctor",authenticateToken, authorizeRole(['doctor']), getSchedulesByToken );

export default router;
