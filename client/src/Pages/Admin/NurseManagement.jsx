import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { FaFileExport } from "react-icons/fa";
import DoctorModal from "../../Components/Admin/DoctorModal";
import { validateExp } from "../../utils/validateUtils";
import ImportDataButton from "../../Components/UploadFile";
import ExportDataButton from "../../Components/UploadFile/ExportFile";

const NurseManagement = () => {
    const [nurses, setNurses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        specialization: "",
        experience: 0,
        gender: "",
    });
    const [editingNurse, setEditingNurse] = useState(null);
    const token = localStorage.getItem("token");
    const specialties = ["Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNurses = nurses.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(nurses.length / itemsPerPage);

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
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/admin/nurses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNurses(response.data);
        } catch (error) {
            console.error("Error fetching nurses:", error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNurse) {
                await axios.put(`${import.meta.env.VITE_BE_URL}/admin/nurses/update/${editingNurse._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${import.meta.env.VITE_BE_URL}/admin/nurses/create`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchNurses();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving nurse:", error);
        }
    };

    const handleExportTemplate = () => {
        const headers = ["Họ tên", "Email", "Mật khẩu", "Chuyên khoa", "Kinh nghiệm"];
        const csvContent = headers.join(",") + "\n";
        const now = new Date();
        const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const dateString = vietnamTime.toISOString().slice(0, 19).replace(/[-T]/g, "_").replace(":", "-");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const fileName = `nurse_template_${dateString}.csv`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (nurse) => {
        setFormData({
            username: nurse.username,
            email: nurse.email,
            password: "",
            specialization: nurse.specialization,
            experience: nurse.experience,
            gender: nurse.gender,
        });
        setEditingNurse(nurse);
        setShowModal(true);
    };

    const handleDelete = async (nurseId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BE_URL}/admin/nurses/delete/${nurseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchNurses();
        } catch (error) {
            console.error("Error deleting nurse:", error);
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", specialization: "", experience: 0 });
        setEditingNurse(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h2 className="text-center mb-4">Quản Lý Y Tá </h2>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary me-1" onClick={handleShowModal}>
                    Tạo tài khoản y tá
                </button>
                <ImportDataButton />
                <ExportDataButton role="nurse" />
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Họ tên </th>
                            <th>Email</th>
                            <th>Chuyên khoa </th>
                            <th>Giới tính </th>
                            <th>Kinh nghiệm </th>
                            <th>Hoạt động </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNurses.length > 0 ? (
                            currentNurses.map((nurse) => (
                                <tr key={nurse._id}>
                                    <td>{nurse.username}</td>
                                    <td>{nurse.email}</td>
                                    <td>{nurse.specialization}</td>
                                    <td>{nurse.gender}</td>
                                    <td>{nurse.experience} năm</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(nurse)}>Chỉnh sửa</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(nurse._id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Không có y tá nào.</td>
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
                    {Math.min(indexOfLastItem, nurses.length)} của{" "}
                    {nurses.length} y tá
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
                editingDoctor={editingNurse}
                specialties={specialties}
                role="Nurse" // Truyền prop role
            />
        </div>
    );
};

export default NurseManagement;