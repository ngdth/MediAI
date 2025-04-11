import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Tests from "../../models/Tests";
import Appointment from "../../models/Appointment";

export const uploadTestImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId, testType } = req.params;
        if (!req.files || !Array.isArray(req.files)) {
            res.status(400).json({ message: "Không có file nào được tải lên." });
            return;
        }
        
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        const userId =appointment.userId;

        let testRecord = await Tests.findOne({ appointmentId, userId });

        if (!testRecord) {
            testRecord = new Tests({ appointmentId, userId });
        }

        const imagePaths = req.files.map((file: Express.Multer.File) => `/uploads/tests/${file.filename}`);

        switch (testType) {
            case "xRay":
                testRecord.xRayImg.push(...imagePaths);
                break;
            case "ultrasound":
                testRecord.ultrasoundImg.push(...imagePaths);
                break;
            case "mri":
                testRecord.mriImg.push(...imagePaths);
                break;
            case "ecg":
                testRecord.ecgImg.push(...imagePaths);
                break;
            default:
                res.status(400).json({ message: "Loại xét nghiệm không hợp lệ." });
                return;
        }

        await testRecord.save();
        res.json({ message: "Upload thành công!", images: imagePaths });
    } catch (error) {
        console.error("Lỗi khi upload ảnh xét nghiệm:", error);
        console.log(error);
        res.status(500).json({ message: "Có lỗi xảy ra khi upload ảnh." });
    }
};

export const deleteTestImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId, imgName } = req.params;
        if (!appointmentId || !imgName) {
            res.status(400).json({ message: "Missing required parameters." });
            return;
        }

        // Find the appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        const userId = appointment.userId;

        // Find the test record
        const testRecord = await Tests.findOne({ appointmentId, userId });
        if (!testRecord) {
            res.status(404).json({ message: "Test record not found" });
            return;
        }

        const imagePath = `/uploads/tests/${imgName}`;

        // Determine which array the image is in
        let found = false;
        if (testRecord.xRayImg.includes(imagePath)) {
            testRecord.xRayImg = testRecord.xRayImg.filter((img) => img !== imagePath);
            found = true;
        } else if (testRecord.ultrasoundImg.includes(imagePath)) {
            testRecord.ultrasoundImg = testRecord.ultrasoundImg.filter((img) => img !== imagePath);
            found = true;
        } else if (testRecord.mriImg.includes(imagePath)) {
            testRecord.mriImg = testRecord.mriImg.filter((img) => img !== imagePath);
            found = true;
        } else if (testRecord.ecgImg.includes(imagePath)) {
            testRecord.ecgImg = testRecord.ecgImg.filter((img) => img !== imagePath);
            found = true;
        }

        if (!found) {
            res.status(404).json({ message: "Image not found in test record" });
            return;
        }

        // Delete the physical file
        const uploadsDir = path.join(__dirname, process.env.UPLOADS_DIR_TESTS || '../../../../client/public/uploads/tests');
        const filePath = path.join(uploadsDir, imgName);
        
        // Kiểm tra xem file có tồn tại không
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            res.status(404).json({ message: "File not found" });
            return;
        }
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                res.status(500).json({ message: "Error deleting file" });
                return;
            }
        });

        // Save the changes
        await testRecord.save();
        res.json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};