import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createService, getAllServices, getServiceById, updateService, deleteService,getActiveServices } from "../controllers/admin/serviceController";

const router = express.Router();

// Tạo dịch vụ mới
router.post("/create", authenticateToken, authorizeRole(["admin"]), createService);

// Lấy danh sách tất cả dịch vụ
router.get("/getAll", authenticateToken, getAllServices);

// Lấy chi tiết một dịch vụ theo ID
router.get("/get/:serviceId", authenticateToken, getServiceById);

//Cập nhật dịch vụ theo ID
router.put("/update/:serviceId", authenticateToken, authorizeRole(["admin"]), updateService);

// Xóa dịch vụ theo ID
router.delete("/delete/:serviceId", authenticateToken, authorizeRole(["admin"]), deleteService);

// Lấy danh sách tất cả dịch vụ có status = active
router.get("/active", getActiveServices);

export default router;