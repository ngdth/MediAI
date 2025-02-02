import express from "express";
import { registerUser, loginUser, verifyCode } from "../controllers/auth/authController";
import { getUserProfile, getAllUsers, getUserById } from "../controllers/auth/authUser";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { addDoctorToFavorites, getDoctorById, removeDoctorFromFavorites, searchDoctorByUsername } from "../controllers/doctor/doctorController";

const router = express.Router();

// User routes
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify", verifyCode);

router.get("/profile", authenticateToken,authorizeRole(["user", "admin"]), getUserProfile);

router.get("/all", authenticateToken,authorizeRole([ "admin"]), getAllUsers);

router.get("/users/:id", authenticateToken, authorizeRole([ "admin"]), getUserById);

router.get("/doctors/:id", authenticateToken, authorizeRole(["user", "admin"]), getDoctorById);

router.post("/search", searchDoctorByUsername);

router.post("/favorites/add/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), addDoctorToFavorites);

router.delete("/favorites/delete/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), removeDoctorFromFavorites);

export default router;
