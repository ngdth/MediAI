import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ServicePackage from "../../models/ServicePackage";

// Tạo gói dịch vụ mới
export const createServicePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description, services, price, imageUrl, status } = req.body;

        if (!name || !description || !services || services.length === 0 || !price || !imageUrl) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }

        const existingPack = await ServicePackage.findOne({ name });
        if (existingPack) {
            res.status(400).json({ error: "Service pack name already exists." });
            return;
        }

        const newServicePackage = new ServicePackage({
            name,
            description,
            services,
            price,
            imageUrl,
            status: status || "active",
        });

        await newServicePackage.save();
        res.status(201).json({ message: "Service pack created successfully.", servicePack: newServicePackage });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách tất cả gói dịch vụ
export const getAllServicePackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const servicePacks = await ServicePackage.find().populate("services", "name price category");
        res.status(200).json(servicePacks);
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết một gói dịch vụ theo ID
export const getServicePackageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { servicePackId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(servicePackId)) {
            res.status(400).json({ error: "Invalid service pack ID." });
            return;
        }

        const servicePack = await ServicePackage.findById(servicePackId).populate("services", "name price category");
        if (!servicePack) {
            res.status(404).json({ error: "Service pack not found." });
            return;
        }

        res.status(200).json(servicePack);
    } catch (error) {
        next(error);
    }
};

// Cập nhật gói dịch vụ theo ID
export const updateServicePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { servicePackId } = req.params;
        const { name, description, services, price, imageUrl, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(servicePackId)) {
            res.status(400).json({ error: "Invalid service pack ID." });
            return;
        }

        const servicePack = await ServicePackage.findById(servicePackId);
        if (!servicePack) {
            res.status(404).json({ error: "Service pack not found." });
            return;
        }

        if (name) servicePack.name = name;
        if (description) servicePack.description = description;
        if (services) servicePack.services = services;
        if (price !== undefined) servicePack.price = price;
        if (imageUrl) servicePack.imageUrl = imageUrl;
        if (status) servicePack.status = status;

        await servicePack.save();
        res.status(200).json({ message: "Service pack updated successfully.", servicePack });
    } catch (error) {
        next(error);
    }
};

// Xóa gói dịch vụ theo ID
export const deleteServicePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { servicePackId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(servicePackId)) {
            res.status(400).json({ error: "Invalid service pack ID." });
            return;
        }

        const servicePack = await ServicePackage.findById(servicePackId);
        if (!servicePack) {
            res.status(404).json({ error: "Service pack not found." });
            return;
        }

        await ServicePackage.findByIdAndDelete(servicePackId);
        res.status(200).json({ message: "Service pack deleted successfully." });
    } catch (error) {
        next(error);
    }
};
