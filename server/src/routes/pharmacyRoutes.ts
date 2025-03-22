import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createBill, getBillDetail, getBills, getBillsByUser, getDoneAppointments, updateBill } from "../controllers/auth/pharmacyController";

const router = express.Router();

router.use(authenticateToken);

router.get("/appointments/done", authorizeRole(["pharmacy"]), getDoneAppointments);

// create bill
router.post('/createbill',  authorizeRole(['pharmacy']), createBill);

// get all bills
router.get('/',  authorizeRole(['admin', 'pharmacy', 'doctor']),getBills);

// Route lấy tất cả hóa đơn của người dùng hiện tại (dựa trên token)
router.get('/my-bills', getBillsByUser);

// // Route lấy chi tiết hóa đơn theo ID 
// router.get('/detail/:billId', getBillDetail);

// Route cập nhật trạng thái thanh toán hóa đơn
router.patch('/:billId', authorizeRole(['pharmacy', 'admin']), updateBill);

export default router;