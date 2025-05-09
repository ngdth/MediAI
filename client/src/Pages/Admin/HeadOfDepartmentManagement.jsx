import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import DoctorModal from "../../Components/Admin/DoctorModal";
import { validateExp } from "../../utils/validateUtils";
import ImportDataButton from "../../Components/UploadFile";
import ExportDataButton from "../../Components/UploadFile/ExportFile";

const HeadOfDepartmentManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        specialization: "",
        experience: 0,
        gender: "",
    });
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);  // Add this state for delete confirmation
    const [doctorToDelete, setDoctorToDelete] = useState(null);  // Track doctor to be deleted
    const token = localStorage.getItem("token");
    const specialties = ["Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(doctors.length / itemsPerPage);

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
        fetchHODs();
    }, []);

    const fetchHODs = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/hods`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctors(response.data);
            console.log("HODs fetched successfully:", response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === "experience") {
            const fixedExp = validateExp(value);
            setFormData({ ...formData, experience: fixedExp });
        }
    };

    const capitalizeName = (name) => {
        return name
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Chuẩn hóa tên và chuẩn bị dữ liệu gửi đi
    const submissionData = {
        ...formData,
        username: formData.username ? capitalizeName(formData.username) : formData.username,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await axios.put(`${import.meta.env.VITE_BE_URL}/admin/hod/update/${editingDoctor._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật thông tin trưởng khoa thành công!");
            } else {
                await axios.post(`${import.meta.env.VITE_BE_URL}/admin/hod/create`, submissionData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Tạo tài khoản trưởng khoa thành công!");
            }
            fetchHODs();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving doctor:", error);
            toast.error(`Lỗi: ${editingDoctor ? "Cập nhật" : "Tạo"} trưởng khoa thất bại!`);
        }
    };

    const handleEdit = (doctor) => {
        setFormData({
            username: doctor.username,
            email: doctor.email,
            password: "",
            specialization: doctor.specialization,
            experience: doctor.experience,
            gender: doctor.gender,
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
            await axios.delete(`${import.meta.env.VITE_BE_URL}/admin/hod/delete/${doctorToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Xóa tài khoản trưởng khoa thành công!");
            fetchHODs();
            setShowDeleteModal(false);  // Close the delete confirmation modal
        } catch (error) {
            console.error("Error deleting doctor:", error);
            toast.error("Lỗi khi xóa tài khoản trưởng khoa!");
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", specialization: "", experience: 0, gender: "" });
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
                <button className="btn btn-primary me-1" onClick={handleShowModal}>
                    Tạo tài khoản trưởng khoa
                </button>
                <ImportDataButton />
                <ExportDataButton role="head of department" />
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Họ tên </th>
                            <th>Email</th>
                            <th>Chuyên khoa</th>
                            <th>Giới tính </th>
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
                                <td>{doctor.gender}</td>
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
                    {Math.min(indexOfLastItem, doctors.length)} của{" "}
                    {doctors.length} trưởng khoa
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
            
            <DoctorModal
                show={showModal}
                handleClose={handleCloseModal}
                handleSubmit={handleSubmit}
                formData={formData}
                handleChange={handleChange}
                editingDoctor={editingDoctor}
                specialties={specialties}
                role="HeadOfDepartment" // Truyền prop role
            />

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
