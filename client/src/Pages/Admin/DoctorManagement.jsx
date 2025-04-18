import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import ImportDataButton from "../../Components/UploadFile";

const DoctorManagement = () => {
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
    const specialties = ["Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];


    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/doctors", {
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
                await axios.put(`http://localhost:8080/admin/doctors/update/${editingDoctor._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/admin/doctors/create", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchDoctors();
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

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8080/admin/doctors/delete/${doctorToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDoctors();
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
            <h2 className="text-center mb-4">Quản Lý Bác Sĩ </h2>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Tạo tài khoản bác sĩ
                </button>
                <ImportDataButton/>
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
                        {editingDoctor ? "Cập nhật thông tin " : "Thêm bác sĩ "}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label className="d-block text-start fw-bold">Họ tên</Form.Label>
                            <Form.Control type="text" name="username" placeholder="Họ tên" value={formData.username} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label className="d-block text-start fw-bold">Email</Form.Label>
                            <Form.Control type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label className="d-block text-start fw-bold">Mật khẩu</Form.Label>
                            <Form.Control type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required={!editingDoctor} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="specialization">
                            <Form.Label className="d-block text-start fw-bold">Chuyên khoa</Form.Label>
                            <Form.Select name="specialization" value={formData.specialization} onChange={handleChange} required >
                                <option value="">Chọn chuyên khoa</option>
                                {specialties.map((spec) => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="experience">
                            <Form.Label className="d-block text-start fw-bold">Kinh nghiệm</Form.Label>
                            <Form.Control type="number" name="experience" value={formData.experience} onChange={handleChange} required />
                        </Form.Group>

                        <div className="text-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Hủy</Button>
                            <Button type="submit" variant="primary">{editingDoctor ? "Cập nhật" : "Tạo"}</Button>
                        </div>
                    </Form>
                </Modal.Body>

            </Modal>
        </div>
    );
};

export default DoctorManagement;
