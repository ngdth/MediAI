import express from "express";
import { registerUser, loginUser, verifyCode } from "../controllers/auth/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyCode);

export default router;
