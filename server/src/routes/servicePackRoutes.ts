import express from "express";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware";
import { createServicePackage, getAllServicePackages,
    getServicePackageById,
    updateServicePackage,
    deleteServicePackage
} from "../controllers/admin/servicePackController";

const router = express.Router();

// Tạo gói dịch vụ mới
router.post("/create", authenticateToken, authorizeRole(["admin"]), createServicePackage);

// Lấy danh sách tất cả gói dịch vụ
router.get("/getAll", getAllServicePackages);

// Lấy chi tiết một gói dịch vụ theo ID
router.get("/:servicePackId", getServicePackageById);

// Cập nhật gói dịch vụ theo ID
router.put("/update/:servicePackId", authenticateToken, authorizeRole(["admin"]), updateServicePackage);

// Xóa gói dịch vụ theo ID
router.delete("/delete/:servicePackId", authenticateToken, authorizeRole(["admin"]), deleteServicePackage);

export default router;
