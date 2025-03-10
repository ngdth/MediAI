import React, { useEffect, useState } from "react";
import axios from "axios";

const NurseDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Pending");

    useEffect(() => {
        fetchAppointments(filterStatus);
        fetchDoctors();
    }, [filterStatus]);

    const fetchAppointments = async (status) => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/doctors", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bác sĩ:", error);
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments(filterStatus);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        }
    };

    const assignDoctor = async (id, doctorId) => {
        try {
            await axios.put(`http://localhost:8080/appointment/${id}/assign`, { doctorId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments(filterStatus);
        } catch (error) {
            console.error("Lỗi khi gán bác sĩ:", error);
        }
    };

    return (
        <div className="nurse-dashboard container">
            <h2 className="text-center mt-4">Quản lý lịch hẹn</h2>
            <div className="filter-section mb-3">
                <label className="me-2 fw-bold">Lọc theo trạng thái:</label>
                <select className="form-select w-auto d-inline-block" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                </select>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Tên bệnh nhân</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Triệu chứng</th>
                            <th>Bác sĩ phụ trách</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patientName}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.symptoms}</td>
                                    <td>
                                        <select className="form-select" onChange={(e) => assignDoctor(appointment._id, e.target.value)}>
                                            <option value="">Chọn bác sĩ</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor._id} value={doctor._id}>
                                                    {doctor.username} - {doctor.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button className="btn btn-success me-2" onClick={() => updateAppointmentStatus(appointment._id, "Assigned")}>
                                            Xác nhận
                                        </button>
                                        <button className="btn btn-danger" onClick={() => updateAppointmentStatus(appointment._id, "Rejected")}>
                                            Từ chối
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Không có lịch hẹn nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NurseDashboard;
