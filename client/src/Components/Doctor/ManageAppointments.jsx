import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RejectModal from "../Nurse/RejectModal";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

const ManageAppointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [doctorRole, setDoctorRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDoctorId(response.data.id);
                setDoctorRole(response.data.role);
            } catch (error) {
                console.error("Error fetching doctor ID:", error);
                alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy thông tin bác sĩ.");
                setLoading(false);
            }
        };

        fetchDoctorId();
    }, [token]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!doctorId) return;

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BE_URL}/appointment?status=Accepted&doctorId=${doctorId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log("Appointments data:", response.data);
                const filteredAppointments = (response.data.data || []).filter((item) => {
                    const appointment = item.appointment;
                    const doctorIds = appointment.doctorId || [];
                    const lastDoctor = doctorIds.length > 0 ? doctorIds[doctorIds.length - 1] : null;
                    const lastDoctorId = lastDoctor && typeof lastDoctor === 'object' ? lastDoctor._id : lastDoctor;
                    return lastDoctorId === doctorId;
                });

                setAppointments(filteredAppointments);
                setFilteredAppointments(filteredAppointments);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointments:", error);
                alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
                setAppointments([]);
                setFilteredAppointments([]);
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [doctorId, token]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (!term) {
            setFilteredAppointments(appointments);
            return;
        }

        const filtered = appointments.filter((item) => {
            const appointment = item.appointment;

            const idMatch = appointment._id?.toLowerCase().includes(term);
            const patientMatch = appointment.patientName?.toLowerCase().includes(term);
            const symptomsMatch = appointment.symptoms?.toLowerCase().includes(term);
            const timeMatch = `${new Date(appointment.date)
                .toLocaleDateString("vi-VN")
                .toLowerCase()} ${appointment.time?.toLowerCase()}`.includes(term);

            return idMatch || patientMatch || symptomsMatch || timeMatch;
        });

        setFilteredAppointments(filtered);
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
            const appointmentA = a.appointment;
            const appointmentB = b.appointment;

            if (sortConfig.key === "id") {
                return sortConfig.direction === "asc"
                    ? appointmentA._id.localeCompare(appointmentB._id)
                    : appointmentB._id.localeCompare(appointmentA._id);
            }

            if (sortConfig.key === "patientName") {
                return sortConfig.direction === "asc"
                    ? appointmentA.patientName.localeCompare(appointmentB.patientName)
                    : appointmentB.patientName.localeCompare(appointmentA.patientName);
            }

            if (sortConfig.key === "symptoms") {
                return sortConfig.direction === "asc"
                    ? appointmentA.symptoms.localeCompare(appointmentB.symptoms)
                    : appointmentB.symptoms.localeCompare(appointmentA.symptoms);
            }

            if (sortConfig.key === "time") {
                const aDateOnly = new Date(appointmentA.date).toISOString().split("T")[0];
                const bDateOnly = new Date(appointmentB.date).toISOString().split("T")[0];
                const aDateTime = new Date(`${aDateOnly}T${appointmentA.time}:00`);
                const bDateTime = new Date(`${bDateOnly}T${appointmentB.time}:00`);

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
    }, [filteredAppointments, sortConfig]);

    const handleReject = (appointment) => {
        const appointmentDate = new Date(appointment.date);
        const now = new Date();
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60); // Chuyển chênh lệch thời gian sang giờ

        if (hoursDiff < 24) {
            toast.error("Lịch hẹn này còn dưới 24 giờ, bạn không thể từ chối.");
            return;
        }

        // Nếu còn trên 24 giờ, hiển thị modal nhập lý do từ chối
        setSelectedAppointmentId(appointment._id);
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối.");
            return;
        }

        if (!selectedAppointmentId) {
            toast.error("Không tìm thấy cuộc hẹn để từ chối.");
            return;
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_BE_URL}/appointment/${selectedAppointmentId}/reject`,
                { rejectReason },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setShowRejectModal(false);
            setRejectReason("");
            setSelectedAppointmentId(null);

            // Cập nhật danh sách lịch hẹn sau khi từ chối thành công
            setAppointments((prevAppointments) =>
                prevAppointments.filter((appt) => appt.appointment._id !== selectedAppointmentId)
            );
            setFilteredAppointments((prevFiltered) =>
                prevFiltered.filter((appt) => appt.appointment._id !== selectedAppointmentId)
            );

            toast.success("Reject cuộc hẹn thành công!");
        } catch (error) {
            console.error("Lỗi khi từ chối cuộc hẹn:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi từ chối lịch hẹn.");
        }
    };

    return (
        <div className="container">
            <h2>Danh sách lịch hẹn</h2>

            <div className="search-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo ID, bệnh nhân, triệu chứng, hoặc thời gian..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <FaSearch className="search-icon" />
                </div>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>
                                <span
                                    onClick={() => handleSort("id")}
                                    style={{ cursor: "pointer" }}
                                >
                                    ID{" "}
                                    {sortConfig.key === "id" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span
                                    onClick={() => handleSort("patientName")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Tên bệnh nhân{" "}
                                    {sortConfig.key === "patientName" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span
                                    onClick={() => handleSort("symptoms")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Triệu chứng{" "}
                                    {sortConfig.key === "symptoms" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span
                                    onClick={() => handleSort("time")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Ngày hẹn{" "}
                                    {sortConfig.key === "time" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((item) => {
                                const appointment = item.appointment;
                                return (
                                    <tr key={appointment._id}>
                                        <td>{appointment._id}</td>
                                        <td>{appointment.patientName || "N/A"}</td>
                                        <td>{appointment.symptoms || "N/A"}</td>
                                        <td>
                                            {new Date(appointment.date).toLocaleDateString("vi-VN")}{" "}
                                            {appointment.time || "N/A"}
                                        </td>
                                        <td>
                                            <Link
                                                to={doctorRole === "head of department"
                                                    ? `/hod/appointments/manage-result/${appointment._id}`
                                                    : `/doctor/appointments/manage-result/${appointment._id}`}
                                                className="btn btn-primary me-2"
                                            >
                                                Tạo kết quả khám bệnh
                                            </Link>
                                            <button
                                                className="btn btn-danger me-2 mt-2"
                                                onClick={() => handleReject(appointment)}
                                            >
                                                Từ chối
                                            </button>
                                            <Link
                                                to={`/meeting/${appointment.meetingCode}`}
                                                state={{ autoStart: true }}
                                                className="btn btn-success me-2 mt-2"
                                            >
                                                Tham gia cuộc gọi
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr key="no-appointments">
                                <td colSpan="4">Không có lịch hẹn nào.</td>
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
        </div>
    );
};

export default ManageAppointment;
