import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import RejectModal from "../../Components/Nurse/RejectModal";

const NursePending = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDoctors, setSelectedDoctors] = useState({});
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showPopup, setShowPopup] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [appointmentsResponse, doctorsResponse] = await Promise.all([
                    fetchAppointments("Pending"),
                    fetchDoctors(),
                ]);

                console.log("Doctors after fetch:", doctorsResponse);
                setDoctors(doctorsResponse);

                await fetchAllSchedules(doctorsResponse);
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (showPopup && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (countdown === 0) {
            setShowPopup(false);
        }
    }, [showPopup, countdown]);

    const fetchAppointments = async (status) => {
        const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Appointments:", response.data.data);
        setAppointments(response.data.data || []);
        return response.data.data || [];
    };

    const fetchDoctors = async () => {
        const response = await axios.get("http://localhost:8080/user/doctors", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Doctors:", response.data);
        return response.data || [];
    };

    const fetchSchedulesByDoctor = async (doctorId) => {
        const response = await axios.get(`http://localhost:8080/schedule/schedules/${doctorId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log(`Schedules for doctor ${doctorId}:`, response.data);
        return response.data || [];
    };

    const fetchAllSchedules = async (doctorsList) => {
        const scheduleData = {};
        for (const doctor of doctorsList) {
            const doctorSchedules = await fetchSchedulesByDoctor(doctor._id);
            scheduleData[doctor._id] = doctorSchedules;
        }
        console.log("All schedules:", scheduleData);
        setSchedules(scheduleData);
    };

    const getAvailableDoctors = (appointment) => {
        const appointmentDate = new Date(appointment.date).toISOString().split("T")[0];
        const appointmentTime = appointment.time;
        const previousDoctorIds = (appointment.doctorId || []).map((d) => d._id || d);

        console.log(`Checking availability for appointment: ${appointment.patientName} - ${appointmentDate} ${appointmentTime}`);

        return doctors.filter((doctor) => {
            const doctorSchedules = schedules[doctor._id] || [];
            if (previousDoctorIds.includes(doctor._id)) {
                console.log(`Doctor ${doctor.username} is excluded due to previous assignment`);
                return false;
            }

            const hasAvailableSlot = doctorSchedules.some((schedule) =>
                schedule.availableSlots.some((slot) => {
                    const slotDate = new Date(slot.date).toISOString().split("T")[0];
                    const isAvailable = slotDate === appointmentDate && slot.time === appointmentTime && !slot.isBooked;
                    console.log(`Doctor ${doctor.username}: Slot ${slotDate} ${slot.time} - Available: ${isAvailable}`);
                    return isAvailable;
                })
            );

            console.log(`Doctor ${doctor.username} is ${hasAvailableSlot ? "available" : "not available"} for ${appointmentDate} ${appointmentTime}`);
            return hasAvailableSlot;
        });
    };

    const updateAppointmentStatus = async (id, status) => {
        await axios.put(`http://localhost:8080/appointment/${id}/status`, { status, rejectReason }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        await fetchAppointments("Pending");
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
            setShowPopup(true);
            setCountdown(10);
        } catch (error) {
            console.error("Error assigning doctor:", error);
            alert("Có lỗi xảy ra khi xác nhận lịch hẹn. Vui lòng thử lại.");
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
                const aDateTime = new Date(`${new Date(a.appointment.date).toISOString().split("T")[0]}T${a.appointment.time}:00`);
                const bDateTime = new Date(`${new Date(b.appointment.date).toISOString().split("T")[0]}T${b.appointment.time}:00`);
                return sortConfig.direction === "asc" ? aDateTime - bDateTime : bDateTime - aDateTime;
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

    const handleReject = (id) => {
        setSelectedAppointmentId(id);
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        if (!selectedAppointmentId) {
            alert("Không tìm thấy cuộc hẹn để từ chối.");
            return;
        }
        await updateAppointmentStatus(selectedAppointmentId, "Rejected");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedAppointmentId(null);
    };

    return (
        <div className="assigned">
            <h2>Lịch hẹn chờ phân công</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>
                                <span onClick={() => handleSort("patientName")} style={{ cursor: "pointer" }}>
                                    Tên bệnh nhân{" "}
                                    {sortConfig.key === "patientName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("time")} style={{ cursor: "pointer" }}>
                                    Thời gian khám{" "}
                                    {sortConfig.key === "time" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("symptoms")} style={{ cursor: "pointer" }}>
                                    Triệu chứng{" "}
                                    {sortConfig.key === "symptoms" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>Bác sĩ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((item) => {
                                const appointment = item.appointment;
                                const availableDoctors = getAvailableDoctors(appointment);

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
                                                            <div>
                                                                {doctor.lastName} {doctor.firstName} - {doctor.specialization || "N/A"}
                                                            </div>
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
                                            {(!appointment.doctorId || appointment.doctorId.length === 0) && (
                                                <button
                                                    className="btn btn-danger me-2"
                                                    onClick={() => handleReject(appointment._id)}
                                                >
                                                    Từ chối
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-primary "
                                                onClick={() => handleViewDetail(appointment._id)}
                                            >
                                                Xem chi tiết
                                            </button>
                                            {appointment.doctorId && appointment.doctorId.length > 0 && (
                                                <button
                                                    className="btn btn-warning"
                                                    onClick={() => updateAppointmentStatus(appointment._id, "Prescription_created")}
                                                >
                                                    Gửi lại cho bác sĩ 
                                                </button>
                                            )}
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

            <RejectModal
                show={showRejectModal}
                handleClose={() => setShowRejectModal(false)}
                handleConfirm={handleConfirmReject}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
            />

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <span className="close-btn" onClick={() => setShowPopup(false)}>✖</span>
                        <div className="checkmark">✔</div>
                        <h2>Xác nhận thành công</h2>
                        <p>
                            Lịch hẹn đã được phân công thành công cho bác sĩ, hãy xác nhận một lần nữa tại trang{" "}
                            <Link
                                to="/nurse/assigned"
                                onClick={() => setShowPopup(false)}
                                style={{ fontWeight: "bold", textDecoration: "underline" }}
                            >
                                sau
                            </Link>.
                            <br />
                            Popup sẽ đóng sau {countdown} giây.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NursePending;