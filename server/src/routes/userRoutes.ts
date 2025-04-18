import express from "express";
import { registerUser, loginUser, verifyAccount, sendOTP, forgotPassword, deleteUnverifiedAcc,changePassword } from "../controllers/auth/authController";
import { getUserProfile, getAllUsers, getUserById, updateProfile, updateAvatar, getUserByIdForUser } from "../controllers/auth/authUser";
import { authenticateToken, authorizeDoctor, authorizeRole } from "../middlewares/authMiddleware";
import { getCurrentUser, addDoctorToFavorites, getAllDoctors, getDoctorById, getFavoriteDoctors, removeDoctorFromFavorites, searchDoctorByUsername } from "../controllers/doctor/doctorController";
import upload from "../middlewares/imgUpload";
import { getAllHOD, getHODById } from "../controllers/headOfDepartment/headOfDepartmentController";

const router = express.Router();

// User routes
router.get("/me", authenticateToken, getCurrentUser);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify", verifyAccount);

router.get("/profile", authenticateToken, getUserProfile);

router.post("/update-avatar", authenticateToken ,upload.single("avatar"), updateAvatar);

router.get("/all", authenticateToken,authorizeRole([ "admin"]), getAllUsers);

router.get("/users/:id", authenticateToken, authorizeRole([ "admin"]), getUserById);

router.get("/user/:id", authenticateToken, getUserByIdForUser);

router.post("/sendotp", sendOTP);

router.post("/changePassword/:id",authenticateToken, changePassword);

router.delete("/deleteUnverified", deleteUnverifiedAcc);

router.post("/forgotPassword", forgotPassword);

router.put("/updateProfile/:id", authenticateToken, updateProfile);

router.get("/doctors", getAllDoctors);

router.get("/hod/:headId", getHODById);

router.get("/hods", getAllHOD);

router.get("/doctors/:doctorId", getDoctorById);

router.post("/search", searchDoctorByUsername);

router.get("/favorites", authenticateToken, authorizeRole(["user", "admin"]), getFavoriteDoctors);

router.post("/favorites/add/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), addDoctorToFavorites);

router.delete("/favorites/delete/:doctorId", authenticateToken, authorizeRole(["user", "admin"]), removeDoctorFromFavorites);

export default router;
