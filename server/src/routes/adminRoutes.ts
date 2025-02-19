import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createDoctorAccount, deleteDoctorAccount, updateDoctorAccount } from "../controllers/admin/adminController";

const router = express.Router();

router.post("/doctors/create", createDoctorAccount);

router.put("/doctors/update/:doctorId", updateDoctorAccount);

router.delete("/doctors/delete/:doctorId", deleteDoctorAccount);

export default router;