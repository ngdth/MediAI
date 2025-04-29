import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const MedicalHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorRole, setdoctorRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDoctorRole();
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('https://amma-care.com/appointment/history', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            
            if (response.data.data) {
                setAppointments(response.data.data);
            } else {
                console.error('No appointments data found!');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorRole = async () => {
        try {
            const response = await axios.get("https://amma-care.com/user/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setdoctorRole(response.data.role);
            console.log("Doctor role:", response.data.role);
        } catch (error) {
            console.error("Error fetching doctor role:", error);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    // Lọc theo tên bệnh nhân (truy cập appointment.appointment.patientName)
    const filteredAppointments = appointments.filter(({ appointment }) =>
        appointment.patientName?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="pending">
            <Row className="justify-content-between">
                <Col md={6}>
                    <h2>Lịch sử khám bệnh</h2>
                </Col>
                <Col md={4}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bệnh nhân"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="form-control mb-3"
                    />
                </Col>
            </Row>

            <table className="table">
                <thead>
                    <tr>
                        <th className="text-center">Bệnh Nhân</th>
                        <th className="text-center">Ngày Khám</th>
                        <th className="text-center">Giờ khám</th>
                        <th className="text-center">Trạng Thái</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="text-center">Đang tải dữ liệu...</td>
                        </tr>
                    ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map(({ appointment }) => (
                            <tr key={appointment._id}>
                                <td className="text-center">{appointment.patientName || "Không rõ"}</td>
                                <td className="text-center">
                                    {appointment.date ? new Date(appointment.date).toLocaleDateString("vi-VN") : "Không rõ"}
                                </td>
                                <td className="text-center">{appointment.time || "Không rõ"}</td>
                                <td className="text-center">{appointment.status || "Không rõ"}</td>
                                <td className="text-center">
                                    <Link 
                                        to={ doctorRole === "doctor" ? `/doctor/medical-history-detail/${appointment._id}` :`/hod/medical-history-detail/${appointment._id}`} 
                                        className="btn btn-primary"
                                    >
                                        Chi tiết
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">Không có lịch sử khám nào của bệnh nhân.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MedicalHistory;
