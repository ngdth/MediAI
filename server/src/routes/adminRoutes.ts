import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createDoctorAccount, createNurseAccount, deleteDoctorAccount, deleteNurseAccount, getAllNurses, getAllUsers, setUserStatus, updateDoctorAccount, updateNurseAccount } from "../controllers/admin/adminController";

const router = express.Router();

router.get("/users", authenticateToken, authorizeRole([ "admin"]), getAllUsers);

router.put("/users/status/:userId", authenticateToken, authorizeRole([ "admin"]), setUserStatus);

router.post("/doctors/create", authenticateToken, authorizeRole([ "admin"]), createDoctorAccount);

router.put("/doctors/update/:doctorId", authenticateToken, authorizeRole([ "admin"]), updateDoctorAccount);

router.delete("/doctors/delete/:doctorId", authenticateToken, authorizeRole([ "admin"]), deleteDoctorAccount);

router.get("/nurses", authenticateToken, authorizeRole([ "admin"]), getAllNurses);

router.post("/nurses/create", authenticateToken, authorizeRole([ "admin"]), createNurseAccount);

router.put("/nurses/update/:nurseId", authenticateToken, authorizeRole([ "admin"]), updateNurseAccount);

router.delete("/nurses/delete/:nurseId", authenticateToken, authorizeRole([ "admin"]), deleteNurseAccount);

export default router;