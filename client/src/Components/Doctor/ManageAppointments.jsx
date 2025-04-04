import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RejectModal from "../Nurse/RejectModal";
import { toast, ToastContainer } from "react-toastify";

const ManageAppointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                const response = await axios.get("http://localhost:8080/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDoctorId(response.data.id);
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
                    `http://localhost:8080/appointment?status=Accepted&doctorId=${doctorId}`,
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
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointments:", error);
                alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
                setAppointments([]);
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [doctorId, token]);

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

            if (sortConfig.key === "date") {
                const aDate = new Date(appointmentA.date);
                const bDate = new Date(appointmentB.date);

                if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
                    console.error("Invalid date format:", aDate, bDate);
                    return 0;
                }

                return sortConfig.direction === "asc"
                    ? aDate - bDate
                    : bDate - aDate;
            }

            return 0;
        });
        return sortableAppointments;
    }, [appointments, sortConfig]);

    const handleReject = (appointment) => {
        const appointmentDate = new Date(appointment.date);
        const now = new Date();
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60); // Chuyển chênh lệch thời gian sang giờ

        if (hoursDiff < 24) {
            alert("Lịch hẹn này còn dưới 24 giờ, bạn không thể từ chối.");
            return;
        }

        // Nếu còn trên 24 giờ, hiển thị modal nhập lý do từ chối
        setSelectedAppointmentId(appointment._id);
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

        try {
            await axios.put(
                `http://localhost:8080/appointment/${selectedAppointmentId}/reject`,
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
                prevAppointments.filter((appt) => appt._id !== selectedAppointmentId)
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
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>
                                <span
                                    onClick={() => handleSort("patientName")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Patient Name{" "}
                                    {sortConfig.key === "patientName" &&
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
                            <th>
                                <span
                                    onClick={() => handleSort("date")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Date{" "}
                                    {sortConfig.key === "date" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((item) => {
                                const appointment = item.appointment;
                                return (
                                    <tr key={appointment._id}>
                                        <td>{appointment.patientName || "N/A"}</td>
                                        <td>{appointment.symptoms || "N/A"}</td>
                                        <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                        <td>
                                            <Link
                                                to={`/doctor/appointments/manage-result/${appointment._id}`}
                                                className="btn btn-primary"
                                            >
                                                Tạo kết quả khám bệnh
                                            </Link>
                                            <button
                                                className="btn btn-danger me-2"
                                                onClick={() => handleReject(appointment)}
                                            >
                                                Từ chối
                                            </button>
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

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default ManageAppointment;
