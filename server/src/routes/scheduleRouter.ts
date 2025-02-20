// src/routes/scheduleRoutes.ts
import express from 'express';
import { createSchedule, viewSchedule } from '../controllers/schedule/scheduleController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.post("/create",authenticateToken, createSchedule, authorizeRole(['doctor'])); // Create schedule
router.get("/view/:doctorId",authenticateToken, viewSchedule ); // View doctor schedule

export default router;
