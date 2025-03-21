import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NursePending = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctors, setSelectedDoctors] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments("Pending");
        fetchDoctors();
    }, []);

    const fetchAppointments = async (status) => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("API response: ", response.data);
            setAppointments(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
            setAppointments([]);
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/doctors", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("Doctors response: ", response.data);
            setDoctors(response.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách bác sĩ.");
            setDoctors([]);
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchAppointments("Pending");
        } catch (error) {
            console.error("Error updating appointment status:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn.");
        }
    };

    const assignDoctor = async (id) => {
        const selectedDoctor = selectedDoctors[id];
        if (!selectedDoctor || !selectedDoctor._id) {
            alert("Vui lòng chọn bác sĩ trước khi xác nhận.");
            return;
        }
        try {
            await axios.put(`http://localhost:8080/appointment/${id}/assign`, { doctorId: selectedDoctor._id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            await updateAppointmentStatus(id, "Assigned");
            fetchAppointments("Pending");
        } catch (error) {
            console.error("Error assigning doctor:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi gán bác sĩ.");
        }
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedAppointments = React.useMemo(() => {
        const sortableAppointments = [...appointments];
        if (!sortConfig.key) return sortableAppointments;

        sortableAppointments.sort((a, b) => {
            if (sortConfig.key === "patientName") {
                return sortConfig.direction === "asc"
                    ? a.appointment.patientName.localeCompare(b.appointment.patientName)
                    : b.appointment.patientName.localeCompare(a.appointment.patientName);
            }

            if (sortConfig.key === "symptoms") {
                return sortConfig.direction === "asc"
                    ? a.appointment.symptoms.localeCompare(b.appointment.symptoms)
                    : b.appointment.symptoms.localeCompare(a.appointment.symptoms);
            }

            if (sortConfig.key === "time") {
                const aDateOnly = new Date(a.appointment.date).toISOString().split("T")[0];
                const bDateOnly = new Date(b.appointment.date).toISOString().split("T")[0];
                const aDateTime = new Date(`${aDateOnly}T${a.appointment.time}:00`);
                const bDateTime = new Date(`${bDateOnly}T${b.appointment.time}:00`);

                if (isNaN(aDateTime.getTime()) || isNaN(bDateTime.getTime())) {
                    console.error("Invalid date format:", aDateTime, bDateTime);
                    return 0;
                }

                return sortConfig.direction === "asc"
                    ? aDateTime - bDateTime
                    : bDateTime - aDateTime;
            }

            return 0;
        });
        return sortableAppointments;
    }, [appointments, sortConfig]);

    const handleViewDetail = (appointmentId) => {
        navigate(`/nurse/general-health/${appointmentId}`);
    };

    const handleDoctorChange = (appointmentId, doctorId) => {
        const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);
        setSelectedDoctors((prev) => ({
            ...prev,
            [appointmentId]: selectedDoctor,
        }));
    };

    return (
        <div className="assigned">
            <h2>Pending Appointments</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>
                                <span
                                    onClick={() => handleSort("patientName")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Patient{" "}
                                    {sortConfig.key === "patientName" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span
                                    onClick={() => handleSort("time")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Time{" "}
                                    {sortConfig.key === "time" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span
                                    onClick={() => handleSort("symptoms")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Symptoms{" "}
                                    {sortConfig.key === "symptoms" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>Doctor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((item) => {
                                const appointment = item.appointment;
                                const previousDoctorIds = (appointment.doctorId || []).map(doctor => doctor._id || doctor);
                                console.log(`Appointment ${appointment._id} - Previous Doctor IDs:`, previousDoctorIds);
                                console.log("All Doctors:", doctors);

                                const availableDoctors = doctors.filter((doctor) => {
                                    const isExcluded = previousDoctorIds.includes(doctor._id);
                                    console.log(`Doctor ${doctor._id} (${doctor.username}) - Excluded: ${isExcluded}`);
                                    return !isExcluded;
                                });

                                return (
                                    <tr key={appointment._id}>
                                        <td>{appointment.patientName || "N/A"}</td>
                                        <td>
                                            {new Date(appointment.date).toLocaleDateString("vi-VN")}{" "}
                                            {appointment.time || "N/A"}
                                        </td>
                                        <td>{appointment.symptoms || "N/A"}</td>
                                        <td>
                                            <select
                                                className="form-select"
                                                onChange={(e) => handleDoctorChange(appointment._id, e.target.value)}
                                                value={selectedDoctors[appointment._id]?._id || ""}
                                            >
                                                <option value="">Chọn bác sĩ</option>
                                                {availableDoctors.length > 0 ? (
                                                    availableDoctors.map((doctor) => (
                                                        <option key={doctor._id} value={doctor._id}>
                                                            {doctor.username} - {doctor.specialization || "N/A"}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="" disabled>
                                                        Không có bác sĩ khả dụng
                                                    </option>
                                                )}
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success me-2"
                                                onClick={() => assignDoctor(appointment._id)}
                                            >
                                                Xác nhận
                                            </button>
                                            <button
                                                className="btn btn-danger me-2"
                                                onClick={() => updateAppointmentStatus(appointment._id, "Rejected")}
                                            >
                                                Từ chối
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleViewDetail(appointment._id)}
                                            >
                                                View Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5">Không có lịch hẹn nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default NursePending;