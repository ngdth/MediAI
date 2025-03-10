import React, { useEffect, useState } from "react";
import axios from "axios";

const NurseDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [statusFilter, setStatusFilter] = useState("Pending"); // Trạng thái mặc định là Pending

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, [statusFilter]); // Gọi lại API khi statusFilter thay đổi

    const fetchAppointments = async (status = "Pending") => {
        try {
            const response = await axios.get(`http://localhost:8080/api/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
    
            // Lọc dữ liệu theo status
            const filteredAppointments = response.data.data.filter(
                appointment => appointment.status === status
            );
    
            setAppointments(filteredAppointments);
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

    const handleStatusChange = async (id, newStatus, doctorId = null) => {
        try {
            await axios.put(`http://localhost:8080/api/appointments/${id}/status`, { status: newStatus, doctorId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (newStatus === "Assigned" && doctorId) {
                await axios.post(`http://localhost:8080/api/appointments/${id}/send-confirmation`, { doctorId }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
            }

            fetchAppointments(); // Cập nhật danh sách cuộc hẹn sau khi thay đổi trạng thái
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái cuộc hẹn:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Quản lý lịch hẹn</h2>

            <div className="d-flex justify-content-between mb-3">
                <label><strong>Lọc theo trạng thái:</strong></label>
                <select className="form-select w-25" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
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
                        {appointments.map((appointment) => (
                            <tr key={appointment._id}>
                                <td>{appointment.patientName}</td>
                                <td>{appointment.date}</td>
                                <td>{appointment.time}</td>
                                <td>{appointment.symptoms}</td>
                                <td>
                                    <select className="form-select" onChange={(e) => handleStatusChange(appointment._id, "Assigned", e.target.value)}>
                                        <option value="">Chọn bác sĩ</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.username}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    {appointment.status === "Pending" && (
                                        <>
                                            <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChange(appointment._id, "Accepted")}>Xác nhận</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(appointment._id, "Rejected")}>Từ chối</button>
                                        </>
                                    )}
                                    {appointment.status === "Assigned" && (
                                        <span className="badge bg-info">Đã gán bác sĩ</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NurseDashboard;
