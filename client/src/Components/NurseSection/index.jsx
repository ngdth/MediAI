import React, { useEffect, useState } from "react";
import axios from "axios";

const NurseAppointmentTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/pending", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/doctors", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bác sĩ:", error);
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/status`, { status: "Accepted" }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi xác nhận lịch hẹn:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/status`, { status: "Rejected" }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi từ chối lịch hẹn:", error);
        }
    };

    const handleAssignDoctor = async (id, doctorId) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/assign`, { doctorId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi gán bác sĩ:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Quản lý lịch hẹn</h2>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Bệnh nhân</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Triệu chứng</th>
                            <th>Xác nhận</th>
                            <th>Từ chối</th>
                            <th>Chọn bác sĩ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment._id}>
                                <td>{appointment.patientName}</td>
                                <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                <td>{appointment.time}</td>
                                <td>{appointment.symptoms}</td>
                                <td>
                                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(appointment._id)}>
                                        Xác nhận
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(appointment._id)}>
                                        Từ chối
                                    </button>
                                </td>
                                <td>
                                    <select className="form-select" onChange={(e) => handleAssignDoctor(appointment._id, e.target.value)}>
                                        <option value="">Chọn bác sĩ</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>{doctor.username}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NurseAppointmentTable;
