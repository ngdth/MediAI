import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const HeadOfDepartmentManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        specialization: "",
        experience: 0,
    });
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);  // Add this state for delete confirmation
    const [doctorToDelete, setDoctorToDelete] = useState(null);  // Track doctor to be deleted
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchHODs();
    }, []);

    const fetchHODs = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/hods", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await axios.put(`http://localhost:8080/admin/hod/update/${editingDoctor._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/admin/hod/create", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchHODs();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving doctor:", error);
        }
    };

    const handleEdit = (doctor) => {
        setFormData({
            username: doctor.username,
            email: doctor.email,
            password: "",
            specialization: doctor.specialization,
            experience: doctor.experience,
        });
        setEditingDoctor(doctor);
        setShowModal(true);
    };

    const handleDelete = (doctor) => {
        setDoctorToDelete(doctor);  // Set the doctor to be deleted
        setShowDeleteModal(true);   // Show the delete confirmation modal
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log(doctorToDelete._id);
            await axios.delete(`http://localhost:8080/admin/hod/delete/${doctorToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchHODs();
            setShowDeleteModal(false);  // Close the delete confirmation modal
        } catch (error) {
            console.error("Error deleting doctor:", error);
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", specialization: "", experience: 0 });
        setEditingDoctor(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h2 className="text-center mb-4">Quản Lý Trưởng Khoa </h2>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Tạo tài khoản trưởng khoa
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Họ tên </th>
                            <th>Email</th>
                            <th>Chuyên khoa</th>
                            <th>Kinh nghiệm </th>
                            <th>Hoạt động </th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doctor) => (
                            <tr key={doctor._id}>
                                <td>{doctor.username}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.experience} năm</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(doctor)}>Chỉnh sửa </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doctor)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm/sửa bác sĩ */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', width: '100%' }}>
                        {editingDoctor ? "Chỉnh sửa thông tin " : "Thêm trưởng khoa "}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-title mb-3" >
                                <h4 style={{ fontWeight: 'bold' }}>
                                    {editingDoctor ? "Chỉnh sửa thông tin" : "Thông tin trưởng Khoa "}
                                </h4>
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="username" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Họ tên </label>
                                <input type="text" name="username" id="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="form-control" />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="email" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Email</label>
                                <input type="email" name="email" id="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control" />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Mật khẩu</label>
                                <input type="password" name="password" id="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required={!editingDoctor} className="form-control" />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="specialization" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Chuyên khoa </label>
                                <input type="text" name="specialization" id="specialization" placeholder="Chuyên khoa" value={formData.specialization} onChange={handleChange} required className="form-control" />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="experience" className="form-label" style={{ fontWeight: 'bold', textAlign: 'left', display: 'block' }}>Kinh nghiệm </label>
                                <input type="number" name="experience" id="experience" placeholder="Kinh Nghiệm" value={formData.experience} onChange={handleChange} required className="form-control" />
                            </div>

                            <div className="text-end">
                                <Button variant="secondary" onClick={handleCloseModal} className="me-2">Hủy </Button>
                                <Button type="submit" variant="primary">{editingDoctor ? "Cập nhật" : "Tạo"}</Button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>XÁC NHẬN XÓA</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc muốn xóa tài khoản này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HeadOfDepartmentManagement;
