// src/routes/scheduleRoutes.ts
import express from 'express';
import { getAllSchedules, getSchedulesByDoctor, getSchedulesByToken, upsertSchedule,  } from '../controllers/schedule/scheduleController';
import { createSchedule, deleteSchedule, updateSchedule,  } from '../controllers/schedule/scheduleController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.get("/schedules/:doctorId",authenticateToken, getSchedulesByDoctor); // View doctor schedule

router.get("/schedules",authenticateToken, getAllSchedules); // View all schedules

router.post("/upsert",authenticateToken, authorizeRole(["doctor", "head of department"]), upsertSchedule); // Manage schedule

router.get("/token",authenticateToken, authorizeRole(["doctor", "head of department"]), getSchedulesByToken);

// create router for update schedule and delete schedule
router.post("/create",authenticateToken, authorizeRole(["doctor", "head of department"]), createSchedule); // Create schedule
router.put("/update/:scheduleId",authenticateToken, updateSchedule, authorizeRole(["doctor", "head of department"])); // Update schedule
router.delete("/delete/:scheduleId",authenticateToken, deleteSchedule, authorizeRole(["doctor", "head of department"])); // Delete schedule

export default router;
