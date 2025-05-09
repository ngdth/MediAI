import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteServiceId, setDeleteServiceId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const specialties = ["Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(services.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const initialFormData = {
        name: "",
        description: "",
        department: "",
        price: 0,
        status: "active",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [editingService, setEditingService] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/service/getAll`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error.response?.data?.error || error.message);
            setServices([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const preparedData = {
            ...formData,
            price: Number(formData.price),
        };
        try {
            if (editingService) {
                await axios.put(`${import.meta.env.VITE_BE_URL}/service/update/${editingService._id}`, preparedData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật dịch vụ thành công");
            } else {
                await axios.post(`${import.meta.env.VITE_BE_URL}/service/create`, preparedData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Thêm dịch vụ thành công");
            }
            fetchServices();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving service:", error.response?.data?.error || error.message);
            toast.error(error.response?.data?.error || "Lỗi khi lưu dịch vụ");
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
            await axios.delete(`${import.meta.env.VITE_BE_URL}/service/delete/${deleteServiceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Xóa dịch vụ thành công");
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error.response?.data?.error || error.message);
            toast.error(error.response?.data?.error || "Lỗi khi xóa dịch vụ");
        }
        setConfirmDelete(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingService(null);
        setFormData(initialFormData);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h2 className="text-center mb-4">Quản Lý Dịch Vụ Khám Bệnh</h2>

            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingService(null);
                        setFormData(initialFormData);
                        setShowModal(true);
                    }}
                >
                    Thêm dịch vụ
                </button>
            </div>

            {/* Danh sách dịch vụ */}
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Tên dịch vụ</th>
                            <th>Mô tả</th>
                            <th>Khoa</th>
                            <th>Giá</th>
                            <th>Trạng Thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                    {currentServices.length > 0 ? (
                            currentServices.map((service) => (
                                <tr key={service._id}>
                                    <td>{service.name}</td>
                                    <td>{service.description}</td>
                                    <td>{service.department}</td>
                                    <td>{service.price} VND</td>
                                    <td>{service.status}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(service)}>
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                setDeleteServiceId(service._id);
                                                setConfirmDelete(true);
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Không có dịch vụ nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                }}
            >
                <div>
                    Đang hiển thị {indexOfFirstItem + 1} đến{" "}
                    {Math.min(indexOfLastItem, services.length)} của{" "}
                    {services.length} dịch vụ
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: currentPage === 1 ? "#f0f0f0" : "#fff",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        Trang trước
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: currentPage === totalPages ? "#f0f0f0" : "#fff",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        Trang tiếp
                    </button>
                </div>
            </div>
            
            {showModal && <div className="modal-overlay"></div>}

            {/* Modal xác nhận xóa */}
            <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>XÁC NHẬN XÓA</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc muốn xóa dịch vụ này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal thêm/sửa dịch vụ */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label className="d-block text-start fw-bold">Tên dịch vụ</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Nhập tên dịch vụ" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="d-block text-start fw-bold">Mô tả</Form.Label>
                            <Form.Control type="text" name="description" placeholder="Nhập mô tả" value={formData.description} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="d-block text-start fw-bold">Khoa</Form.Label>
                            <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                                <option value="">Chọn chuyên khoa</option>
                                {specialties.map((specialty, idx) => (
                                    <option key={idx} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="d-block text-start fw-bold">Giá</Form.Label>
                            <Form.Control type="number" name="price" placeholder="Nhập giá" value={formData.price} onChange={handleChange} required min="1" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start fw-bold">Trạng thái</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Ngừng hoạt động</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" variant="primary">
                            {editingService ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ServiceManagement;
