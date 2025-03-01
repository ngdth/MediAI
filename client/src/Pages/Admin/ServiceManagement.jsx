import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("bg-success");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteServiceId, setDeleteServiceId] = useState(null);
    
    const initialFormData = {
        name: "",
        description: "",
        department: "",
        category: "",
        price: 0,
        duration: "",
        status: "active"
    };

    const [formData, setFormData] = useState(initialFormData);
    const [editingService, setEditingService] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get("http://localhost:8080/service/getAll", {
                headers: { Authorization: `Bearer ${token}` },  
            });
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error.response?.data?.error || error.message);
            setServices([]);
            showToastMessage(error.response?.data?.error || "Error fetching services", "bg-danger");
        }
    };

    const showToastMessage = (message, variant) => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 60000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "price" ? Number(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await axios.put(`http://localhost:8080/service/update/${editingService._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToastMessage("Service updated successfully", "bg-success");
            } else {
                await axios.post("http://localhost:8080/service/create", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToastMessage("Service added successfully", "bg-success");
            }
            fetchServices();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving service:", error.response?.data?.error || error.message);
            showToastMessage(error.response?.data?.error || "Error saving service", "bg-danger");
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData(service); // Cập nhật form với dữ liệu của dịch vụ được chọn
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteServiceId) return;
        try {
            await axios.delete(`http://localhost:8080/service/delete/${deleteServiceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToastMessage("Service deleted successfully", "bg-success");
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error.response?.data?.error || error.message);
            showToastMessage(error.response?.data?.error || "Error deleting service", "bg-danger");
        }
        setConfirmDelete(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingService(null);
        setFormData(initialFormData);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 className="text-center mb-4">Service Management</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={() => {
                    setEditingService(null);
                    setFormData(initialFormData);
                    setShowModal(true);
                }}>
                    Add Service
                </button>
            </div>

            {/* Toast thông báo */}
            <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} className={toastVariant} autohide onClose={() => setShowToast(false)}>
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Danh sách dịch vụ */}
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Department</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service._id}>
                                <td>{service.name}</td>
                                <td>{service.description}</td>
                                <td>{service.department}</td>
                                <td>{service.category}</td>
                                <td>{service.price} VND</td>
                                <td>{service.duration} Phút</td>
                                <td>{service.status}</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(service)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => {
                                        setDeleteServiceId(service._id);
                                        setConfirmDelete(true);
                                    }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal xác nhận xóa */}
            <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this service?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm/sửa dịch vụ */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingService ? "Edit Service" : "Add Service"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Service Name" value={formData.name} onChange={handleChange} required className="form-control mb-2" />
                        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="form-control mb-2" />
                        <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required className="form-control mb-2" />
                        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required className="form-control mb-2" />
                        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required min="1" className="form-control mb-2" />
                        <input type="text" name="duration" placeholder="Duration" value={formData.duration} onChange={handleChange} required className="form-control mb-2" />
                        <Button type="submit" variant="primary">{editingService ? "Update" : "Add"}</Button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ServiceManagement;
