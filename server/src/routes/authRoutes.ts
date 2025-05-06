import { Router } from "express";
import { loginWithGoogle, googleCallback, logoutGoogle } from "../controllers/auth/googleAuth";

const router = Router();

router.get("/google", loginWithGoogle);
router.get("/callback", googleCallback);
router.post("/logout", logoutGoogle);

export default router;
