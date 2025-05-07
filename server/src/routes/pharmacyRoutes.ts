import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createBill, getBillDetail, getBills, getBillsByUser, getDoneAppointments, updateBill, updateMedicinesPrice } from "../controllers/auth/pharmacyController";

const router = express.Router();

router.get("/appointments/done", authenticateToken, authorizeRole(["pharmacy", "doctor"]), getDoneAppointments);

// create bill
router.post("/createbill", authenticateToken,  authorizeRole(["pharmacy"]), createBill);

// get all bills
router.get("/bills", authenticateToken,  authorizeRole(["admin", "pharmacy", "doctor"]),getBills);

// Route lấy tất cả hóa đơn của người dùng hiện tại (dựa trên token)
router.get("/my-bills", authenticateToken, getBillsByUser);

// Route lấy chi tiết hóa đơn theo ID 
router.get("/detail/:billId", authenticateToken, getBillDetail);

// Route cập nhật trạng thái thanh toán hóa đơn
router.patch("/:billId", authenticateToken, authorizeRole(["pharmacy", "admin"]), updateBill);

// Update medicine prices in a bill
router.put('/update-medicines-price/:billId', authenticateToken, authorizeRole(["pharmacy"]), updateMedicinesPrice);

export default router;
