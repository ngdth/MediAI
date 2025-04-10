import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createDoctorAccount, createNurseAccount, createPharmacy, deleteDoctorAccount, deleteNurseAccount, deletePharmacy, getAllNurses, getAllPharmacy, getAllUsers, setUserStatus, updateDoctorAccount, updateNurseAccount, updatePharmacy } from "../controllers/admin/adminController";
import { createHODAccount, deleteHOD, updateHOD } from "../controllers/headOfDepartment/headOfDepartmentController";

const router = express.Router();

router.get("/users", authenticateToken, authorizeRole(["admin"]), getAllUsers);

router.put("/users/status/:userId", authenticateToken, authorizeRole(["admin"]), setUserStatus);

router.post("/doctors/create", authenticateToken, authorizeRole(["admin"]), createDoctorAccount);

router.put("/doctors/update/:doctorId", authenticateToken, authorizeRole(["admin"]), updateDoctorAccount);

router.delete("/doctors/delete/:doctorId", authenticateToken, authorizeRole(["admin"]), deleteDoctorAccount);

router.post("/hod/create", authenticateToken, authorizeRole(["admin"]), createHODAccount);

router.put("/hod/update/:hodId", authenticateToken, authorizeRole(["admin"]), updateHOD);

router.delete("/hod/delete/:hodId", authenticateToken, authorizeRole(["admin"]), deleteHOD);

router.get("/nurses", authenticateToken, authorizeRole(["admin"]), getAllNurses);

router.post("/nurses/create", authenticateToken, authorizeRole(["admin"]), createNurseAccount);

router.put("/nurses/update/:nurseId", authenticateToken, authorizeRole(["admin"]), updateNurseAccount);

router.delete("/nurses/delete/:nurseId", authenticateToken, authorizeRole(["admin"]), deleteNurseAccount);

router.get("/pharmacy", authenticateToken, getAllPharmacy);

router.post("/pharmacy/create", authenticateToken, authorizeRole(["admin"]), createPharmacy);

router.put("/pharmacy/update/:pharmacyId", authenticateToken, authorizeRole(["admin"]), updatePharmacy);

router.delete("/pharmacy/delete/:pharmacyId", authenticateToken, authorizeRole(["admin"]), deletePharmacy);

export default router;