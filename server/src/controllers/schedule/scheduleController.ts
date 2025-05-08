// src/controllers/scheduleController.ts
import { Request, Response, NextFunction } from 'express';
import Schedule from '../../models/Schedule';
import mongoose from 'mongoose';

export const upsertSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const doctorId = req.user?.id; // Lấy ID bác sĩ từ user đã đăng nhập
        const { availableSlots } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!Array.isArray(availableSlots) || availableSlots.length === 0) {
            res.status(400).json({ error: "Danh sách khung giờ rảnh không được để trống" });
            return;
        }

        availableSlots.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (dateA !== dateB) {
                return dateA - dateB;
            }

            const timeA = parseInt(a.time.replace(":", ""), 10);
            const timeB = parseInt(b.time.replace(":", ""), 10);
            return timeA - timeB;
        });

        // Tìm xem bác sĩ đã có lịch chưa
        const existingSchedule = await Schedule.findOne({ doctorId });

        if (existingSchedule) {
            const existingSlots = existingSchedule.availableSlots;

            const bookedSlots = existingSlots.filter(slot => slot.isBooked === true);

            const unbookedSlots = availableSlots.filter(newSlot =>
                !bookedSlots.some(
                    booked =>
                        new Date(booked.date).toISOString() === new Date(newSlot.date).toISOString() &&
                        booked.time === newSlot.time
                )
            );

            const mergedSlots = [...bookedSlots, ...unbookedSlots];

            mergedSlots.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA !== dateB) return dateA - dateB;

                const timeA = parseInt(a.time.replace(":", ""), 10);
                const timeB = parseInt(b.time.replace(":", ""), 10);
                return timeA - timeB;
            });

            existingSchedule.availableSlots = mergedSlots;
            await existingSchedule.save();

            res.status(200).json({
                message: "Cập nhật lịch khám thành công. Các khung giờ đã đặt được giữ nguyên.",
                data: existingSchedule,
            });
        } else {
            // Tạo lịch mới nếu chưa có
            const newSchedule = new Schedule({
                doctorId,
                availableSlots,
            });

            await newSchedule.save();

            res.status(201).json({
                message: "Tạo lịch khám thành công",
                data: newSchedule,
            });
        }
    } catch (error) {
        next(error);
    }
};

// Tạo lịch khám
export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = req.user?.id; // Lấy ID bác sĩ từ người dùng đã xác thực
        const { availableSlots } = req.body;

        const newSchedule = new Schedule({
            doctorId,
            availableSlots,
        });

        await newSchedule.save();

        res.status(201).json({
            message: 'Tạo lịch khám thành công',
            data: newSchedule,
        });
    } catch (error) {
        next(error);
    }
};

// API: Xem lịch khám của bác sĩ
export const getAllSchedules = async (req: Request, res: Response) => {
    try {
        const schedules = await Schedule.getAllSchedules();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách lịch khám' });
    }
};

// Lấy lịch khám theo bác sĩ
export const getSchedulesByDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId } = req.params;

        // Kiểm tra doctorId có hợp lệ hay không
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ message: 'doctorId không hợp lệ' });
            return;
        }

        // Lấy lịch khám theo doctorId
        const schedules = await Schedule.find({ doctorId })
            .populate('doctorId', 'name email role') // Lấy thông tin bác sĩ
            .sort({ createdAt: -1 }); // Sắp xếp theo createdAt

        // if (!schedules || schedules.length === 0) {
        //     res.status(404).json({ message: 'Không tìm thấy lịch khám cho bác sĩ này' });
        //     return;
        // }

        // Trả về danh sách lịch khám
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error when getting schedules:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách lịch khám' });
    }
};

// Lấy lịch khám theo token
export const getSchedulesByToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.user?.id; // 🔥 Lấy doctorId từ token

        if (!doctorId) {
            res.status(400).json({ message: "Không tìm thấy thông tin bác sĩ" });
            return;
        }

        // Lấy lịch khám theo doctorId
        const schedules = await Schedule.find({ doctorId })
            .populate('doctorId', 'name email role') // Lấy thông tin bác sĩ
            .sort({ createdAt: -1 }); // Sắp xếp theo createdAt

        if (!schedules || schedules.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy lịch khám cho bác sĩ này' });
            return;
        }

        // Trả về danh sách lịch khám
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error when getting schedules:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách lịch khám' });
    }
};

// Cập nhật lịch khám
export const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { availableSlots } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID lịch khám không hợp lệ' });
            return;
        }

        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            { availableSlots },
            { new: true }
        );

        if (!updatedSchedule) {
            res.status(404).json({ message: 'Không tìm thấy lịch khám' });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật lịch khám thành công',
            data: updatedSchedule,
        });
    } catch (error) {
        next(error);
    }
};

// Xóa lịch khám
export const deleteSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID lịch khám không hợp lệ' });
            return;
        }

        const deletedSchedule = await Schedule.findByIdAndDelete(id);

        if (!deletedSchedule) {
            res.status(404).json({ message: 'Không tìm thấy lịch khám' });
            return;
        }

        res.status(200).json({
            message: 'Xóa lịch khám thành công',
            data: deletedSchedule,
        });
    } catch (error) {
        next(error);
    }
};