import express from "express";
import { registerUser, loginUser, verifyAccount, sendOTP, forgotPassword, deleteUnverifiedAcc,changePassword } from "../controllers/auth/authController";
import { getUserProfile, getAllUsers, getUserById, updateProfile } from "../controllers/auth/authUser";
import { authenticateToken, authorizeDoctor, authorizeRole } from "../middlewares/authMiddleware";
import { addDoctorToFavorites, getAllDoctors, getDoctorById, getFavoriteDoctors, removeDoctorFromFavorites, searchDoctorByUsername } from "../controllers/doctor/doctorController";

const router = express.Router();

// User routes
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify", verifyAccount);

router.get("/profile", authenticateToken, getUserProfile);

router.get("/all", authenticateToken,authorizeRole([ "admin"]), getAllUsers);

router.get("/users/:id", authenticateToken, authorizeRole([ "admin"]), getUserById);

router.post("/sendotp", sendOTP);

router.post("/changePassword/:id",authenticateToken, changePassword);

router.delete("/deleteUnverified", deleteUnverifiedAcc);

router.post("/forgotPassword", forgotPassword);

router.put("/updateProfile/:id", authenticateToken, updateProfile);

router.get("/doctors", getAllDoctors);

router.get("/doctors/:doctorId", getDoctorById);

router.post("/search", searchDoctorByUsername);

router.get("/favorites", authenticateToken, authorizeRole(["user", "admin"]), getFavoriteDoctors);

router.post("/favorites/add/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), addDoctorToFavorites);

router.delete("/favorites/delete/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), removeDoctorFromFavorites);

export default router;
