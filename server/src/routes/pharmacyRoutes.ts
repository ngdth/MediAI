import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createBill, getBillId, getBills, getDoneAppointments } from "../controllers/auth/pharmacyController";
// import { createBill, getBillId, getBills, getDoneAppointments } from "../controllers/auth/pharmacyController";


const router = express.Router();

router.get("/appointments/done", authenticateToken, authorizeRole(["pharmacy"]), getDoneAppointments);


// create bill
router.post('/createBill', authenticateToken, authorizeRole(['pharmacy']), createBill);
// get all bills
router.get('/', authenticateToken, authorizeRole(['admin', 'pharmacy', 'doctor']),getBills);
// get bill by id
router.get('/:billId', authenticateToken, authorizeRole(['admin', 'pharmacy', 'doctor', 'patient']), getBillId);
export default router;