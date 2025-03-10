import React, { useEffect, useState } from "react";
import axios from "axios";

const NurseDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    
    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/pending", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/users/doctors", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setDoctors(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bác sĩ:", error);
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/status`, { status: "Accepted" });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi xác nhận lịch hẹn:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/status`, { status: "Rejected" });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi từ chối lịch hẹn:", error);
        }
    };

    const handleAssignDoctor = async (id, doctorId) => {
        try {
            await axios.put(`http://localhost:8080/api/${id}/assign`, { doctorId });
            fetchAppointments();
        } catch (error) {
            console.error("Lỗi khi gán bác sĩ:", error);
        }
    };

    return (
        <div className="nurse-dashboard">
            <h2>Quản lý lịch hẹn</h2>
            <ul>
                {appointments.map((appointment) => (
                    <li key={appointment._id}>
                        <p><strong>Tên bệnh nhân:</strong> {appointment.patientName}</p>
                        <p><strong>Ngày:</strong> {appointment.date}</p>
                        <p><strong>Giờ:</strong> {appointment.time}</p>
                        <p><strong>Triệu chứng:</strong> {appointment.symptoms}</p>
                        <button onClick={() => handleAccept(appointment._id)}>Xác nhận</button>
                        <button onClick={() => handleReject(appointment._id)}>Từ chối</button>
                        <select onChange={(e) => handleAssignDoctor(appointment._id, e.target.value)}>
                            <option value="">Chọn bác sĩ</option>
                            {doctors.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>{doctor.username}</option>
                            ))}
                        </select>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NurseDashboard;
