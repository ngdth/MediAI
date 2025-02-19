import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createDoctorAccount, createNurseAccount, deleteDoctorAccount, deleteNurseAccount, getAllNurses, updateDoctorAccount, updateNurseAccount } from "../controllers/admin/adminController";

const router = express.Router();

router.post("/doctors/create", createDoctorAccount);

router.put("/doctors/update/:doctorId", updateDoctorAccount);

router.delete("/doctors/delete/:doctorId", deleteDoctorAccount);

router.get("/nurses", getAllNurses);

router.post("/nurses/create", createNurseAccount);

router.put("/nurses/update/:nurseId", updateNurseAccount);

router.delete("/nurses/delete/:nurseId", deleteNurseAccount);

export default router;