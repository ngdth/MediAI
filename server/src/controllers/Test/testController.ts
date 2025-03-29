import { Request, Response } from "express";
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
