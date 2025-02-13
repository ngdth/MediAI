import express from "express";
import { registerUser, loginUser, verifyAccount, sendOTP, resetPassword } from "../controllers/auth/authController";
import { getUserProfile, getAllUsers, getUserById } from "../controllers/auth/authUser";
import { authenticateToken, authorizeDoctor, authorizeRole } from "../middlewares/authMiddleware";
import { addDoctorToFavorites, getAllDoctors, getDoctorById, removeDoctorFromFavorites, searchDoctorByUsername } from "../controllers/doctor/doctorController";

const router = express.Router();

// User routes
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify", verifyAccount);

router.get("/profile", authenticateToken,authorizeRole(["user", "admin"]), getUserProfile);

router.get("/all", authenticateToken,authorizeRole([ "admin"]), getAllUsers);

router.get("/users/:id", authenticateToken, authorizeRole([ "admin"]), getUserById);

router.post("/sendotp", sendOTP);

router.post("/resetpassword", resetPassword);

router.get("/doctors", getAllDoctors);

router.get("/doctors/:doctorId", getDoctorById);

router.post("/search", searchDoctorByUsername);

router.post("/favorites/add/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), addDoctorToFavorites);

router.delete("/favorites/delete/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), removeDoctorFromFavorites);

export default router;
