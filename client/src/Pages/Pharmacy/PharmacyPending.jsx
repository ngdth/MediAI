import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const PharmacyPending = () => {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/pharmacy/appointments/done`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
    };

    // Lọc theo search term
    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patientName?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="pending">
            <Row className="justify-content-between">
                <Col md={6}>
                    <h2>Đơn thuốc đang chờ</h2>
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
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="text-center">Đang tải dữ liệu...</td>
                        </tr>
                    ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
                            <tr key={appointment._id}>
                                <td className="text-center">{appointment.patientName}</td>
                                <td className="text-center">{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                <td className="text-center">{appointment.time}</td>
                                <td className="text-center">
                                    <Link to={`/pharmacy/prescription/${appointment._id}`} className="btn btn-primary">
                                        Tạo hóa đơn 
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">Không có đơn thuốc nào đang chờ duyệt.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PharmacyPending;
