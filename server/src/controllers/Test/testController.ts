import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Tests from "../../models/Tests";
import Appointment from "../../models/Appointment";
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";
import bucket from "../../config/firebase";

const uploadFileToFirebase = (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileName = `tests/${uuidv4()}-${file.originalname}`;
        const firebaseFile = bucket.file(fileName);

        const stream = firebaseFile.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on("error", (err) => {
            console.error("🔥 Lỗi khi upload ảnh lên Firebase:", err);
            reject(err);
        });

        stream.on("finish", async () => {
            await firebaseFile.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
            resolve(publicUrl);
        });

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

export const uploadTestImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { appointmentId, testType } = req.params;
        if (!req.files || !Array.isArray(req.files)) {
            res.status(400).json({ message: "Không có file nào được tải lên." });
            return;
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        const userId = appointment.userId;

        let testRecord = await Tests.findOne({ appointmentId, userId });

        if (!testRecord) {
            testRecord = new Tests({ appointmentId, userId });
        }

        const imagePaths = await Promise.all(
            (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => uploadFileToFirebase(file))
        );

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
            res.status(400).json({ message: "Thiếu tham số bắt buộc." });
            return;
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        const userId = appointment.userId;

        const testRecord = await Tests.findOne({ appointmentId, userId });
        if (!testRecord) {
            res.status(404).json({ message: "Không tìm thấy xét nghiệm" });
            return;
        }

        const imagePath = `https://storage.googleapis.com/${bucket.name}/tests/${imgName}`;

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
            res.status(404).json({ message: "Không tìm thấy ảnh trong test database" });
            return;
        }

        const fileName = imgName.split('/').pop();

        const firebaseFile = bucket.file(`tests/${fileName}`);

        await firebaseFile.delete();
        console.log(`Đã xóa ảnh từ Firebase: ${fileName}`);

        await testRecord.save();
        res.json({ message: "Xóa ảnh thành công từ Firebase" });
    } catch (error) {
        console.error("Lỗi khi xóa ảnh từ Firebase:", error);
        res.status(500).json({ message: "Lỗi khi xóa ảnh từ Firebase", error });
    }
};