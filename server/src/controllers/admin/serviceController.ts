    import { Request, Response, NextFunction } from "express";
    import mongoose from "mongoose";
    import Service from "../../models/Service";

    // Tạo dịch vụ mới
    export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, description, department, category, price, duration, status } = req.body;

            if (!name || !description || !department || !category || !price || !duration) {
                res.status(400).json({ error: "Missing required fields." });
                return;
            }

            const existingService = await Service.findOne({ name });
            if (existingService) {
                res.status(400).json({ error: "Service name already exists." });
                return;
            }

            const newService = new Service({
                name,
                description,
                department,
                category,
                price,
                duration,
                status: status || "active",
            });

            await newService.save();
            res.status(201).json({ message: "Service created successfully.", service: newService });
        } catch (error) {
            next(error);
        }
    };

    // Lấy danh sách tất cả dịch vụ
    export const getAllServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const services = await Service.find();
            res.status(200).json(services);
        } catch (error) {
            next(error);
        }
    };

    // Lấy chi tiết một dịch vụ theo ID
    export const getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                res.status(400).json({ error: "Invalid service ID." });
                return;
            }

            const service = await Service.findById(serviceId);
            if (!service) {
                res.status(404).json({ error: "Service not found." });
                return;
            }

            res.status(200).json(service);
        } catch (error) {
            next(error);
        }
    };

    // Cập nhật dịch vụ theo ID
    export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const { name, description, department, category, price, duration, status } = req.body;

            if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                res.status(400).json({ error: "Invalid service ID." });
                return;
            }

            const service = await Service.findById(serviceId);
            if (!service) {
                res.status(404).json({ error: "Service not found." });
                return;
            }

            if (name) service.name = name;
            if (description) service.description = description;
            if (department) service.department = department;
            if (price !== undefined) service.price = price;
            if (status) service.status = status;

            await service.save();
            res.status(200).json({ message: "Service updated successfully.", service });
        } catch (error) {
            next(error);
        }
    };

    // Xóa dịch vụ theo ID
    export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                res.status(400).json({ error: "Invalid service ID." });
                return;
            }

            const service = await Service.findById(serviceId);
            if (!service) {
                res.status(404).json({ error: "Service not found." });
                return;
            }

            await Service.findByIdAndDelete(serviceId);
            res.status(200).json({ message: "Service deleted successfully." });
        } catch (error) {
            next(error);
        }
    };

    // Lấy danh sách tất cả dịch vụ có status = active
    export const getActiveServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const activeServices = await Service.find({ status: "active" });
            res.status(200).json(activeServices);
        } catch (error) {
            next(error);
        }
    };