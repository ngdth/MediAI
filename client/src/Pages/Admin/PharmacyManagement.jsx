import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const PharmacyManagement = () => {
    const [pharmacy, setPharmacy] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        pharmacyName: "",
        location: "",
    });
    const [editingPharmacy, setEditingPharmacy] = useState(null);
    const token = localStorage.getItem("token");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    useEffect(() => {
        fetchPharmacy();
    }, []);

    const fetchPharmacy = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/admin/pharmacy`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPharmacy(response.data);
        } catch (error) {
            console.error("Error fetching pharmacy:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPharmacy) {
                await axios.put(`${import.meta.env.VITE_BE_URL}/admin/pharmacy/update/${editingPharmacy._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${import.meta.env.VITE_BE_URL}/admin/pharmacy/create`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchPharmacy();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving pharmacy:", error);
        }
    };

    const handleEdit = (pharmacy) => {
        setFormData({
            username: pharmacy.username,
            email: pharmacy.email,
            password: "",
            pharmacyName: pharmacy.pharmacyName,
            location: pharmacy.location,
        });
        setEditingPharmacy(pharmacy);
        setShowModal(true);
    };

    const handleDelete = async (pharmacyId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BE_URL}/admin/pharmacy/delete/${pharmacyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPharmacy();
        } catch (error) {
            console.error("Error deleting pharmacy:", error);
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", pharmacyName: "", location: "" });
        setEditingPharmacy(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h2 className="text-center mb-4">Quản lí nhà thuốc</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Thêm Nhà Thuốc
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Tên Nhà Thuốc</th>
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPharmacy.length > 0 ? (
                            currentPharmacy.map((pharmacy) => (
                                <tr key={pharmacy._id}>
                                    <td>{pharmacy.username}</td>
                                    <td>{pharmacy.email}</td>
                                    <td>{pharmacy.pharmacyName}</td>
                                    <td>{pharmacy.location}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(pharmacy)}>Sửa</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(pharmacy._id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">Không có nhà thuốc nào.</td>
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
                    {Math.min(indexOfLastItem, pharmacy.length)} của{" "}
                    {pharmacy.length} nhà thuốc
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
            
            {/* Modal thêm/sửa Pharmacy */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingPharmacy ? "Chỉnh Sửa" : "Thêm Nhà Thuốc"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label htmlFor="username" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Họ tên </label>
                            <input type="text" name="username" placeholder="Họ tên" value={formData.username} onChange={handleChange} required className="form-control mb-2" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="email" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Email </label>
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control mb-2" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Mật khẩu </label>
                            <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required={!editingPharmacy} className="form-control mb-2" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="pharmacyName" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Tên Nhà Thuốc </label>
                            <input type="text" name="pharmacyName" placeholder="Tên Nhà Thuốc" value={formData.pharmacyName} onChange={handleChange} required className="form-control mb-2" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="location" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Địa chỉ </label>
                            <input type="text" name="location" placeholder="Địa chỉ" value={formData.location} onChange={handleChange} required className="form-control mb-2" />
                        </div>

                        <div className="text-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Hủy</Button>
                            <Button type="submit" variant="primary">{editingPharmacy ? "Cập nhật" : "Thêm"}</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PharmacyManagement;
