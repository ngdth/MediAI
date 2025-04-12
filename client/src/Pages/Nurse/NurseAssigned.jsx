import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import RejectModal from "../../Components/Nurse/RejectModal";

const NurseAssigned = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments("Assigned");
    fetchDoctors();
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
    try {
      const response = await axios.get(
        `http://localhost:8080/appointment?status=${status}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("API response:", response.data);
      setAppointments(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const [doctorRes, hodRes] = await Promise.all([
        axios.get("http://localhost:8080/user/doctors", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:8080/user/hods", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);
  
      const doctorMap = {};
      [...doctorRes.data, ...hodRes.data].forEach((user) => {
        doctorMap[user._id] = user.username;
      });
  
      setDoctors(doctorMap);
    } catch (error) {
      console.error("Error fetching doctors and HODs:", error);
      setDoctors({});
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8080/appointment/${id}/status`,
        { status, rejectReason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (status === "Accepted") {
        const appointment = appointments.find((item) => item.appointment._id === id)?.appointment;
        if (appointment) {
          const doctorId = appointment.doctorId[0]; 
          const message = `Bạn có lịch hẹn mới vào ${new Date(appointment.date).toLocaleDateString(
            "vi-VN"
          )} lúc ${appointment.time}`;

          await axios.post(
            "http://localhost:8080/notification",
            {
              userId: doctorId,
              message,
              type: "appointment",
              relatedId: id,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
        }
        setShowPopup(true);
        setCountdown(10);
      }

      fetchAppointments("Assigned");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn. Vui lòng thử lại.");
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

      if (sortConfig.key === "doctor") {
        const aDoctorNames = appointmentA.doctorId
          .map((doctor) => doctors[doctor._id] || "N/A")
          .join(", ");
        const bDoctorNames = appointmentB.doctorId
          .map((doctor) => doctors[doctor._id] || "N/A")
          .join(", ");
        return sortConfig.direction === "asc"
          ? aDoctorNames.localeCompare(bDoctorNames)
          : bDoctorNames.localeCompare(aDoctorNames);
      }

      return 0;
    });
    return sortableAppointments;
  }, [appointments, sortConfig, doctors]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/nurse/general-health/${appointmentId}`);
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

    try {
      await updateAppointmentStatus(selectedAppointmentId, "Rejected");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedAppointmentId(null);
      fetchAppointments("Assigned");
    } catch (error) {
      console.error("Lỗi khi từ chối cuộc hẹn:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi từ chối lịch hẹn.");
    }
  };

  return (
    <div className="assigned">
      <h2>Assigned Appointments</h2>
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
                  Tên bệnh nhân{" "}
                  {sortConfig.key === "patientName" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSort("time")}
                  style={{ cursor: "pointer" }}
                >
                  Thời gian khám{" "}
                  {sortConfig.key === "time" &&
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
                  onClick={() => handleSort("doctor")}
                  style={{ cursor: "pointer" }}
                >
                  Bác sĩ{" "}
                  {sortConfig.key === "doctor" &&
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
                const doctorNames = appointment.doctorId
                  .map((doctor) => doctors[doctor._id] || "N/A")
                  .join(", ");

                return (
                  <tr key={appointment._id}>
                    <td>{appointment.patientName || "N/A"}</td>
                    <td>
                      {appointment.date
                        ? new Date(appointment.date).toLocaleDateString("vi-VN")
                        : "N/A"}{" "}
                      {appointment.time || "N/A"}
                    </td>
                    <td>{appointment.symptoms || "N/A"}</td>
                    <td>{doctorNames || "Chưa gán bác sĩ nào"}</td>
                    <td>
                      <button
                        className="btn btn-success me-2"
                        onClick={() => updateAppointmentStatus(appointment._id, "Accepted")}
                      >
                        Xác nhận
                      </button>
                      <button
                        className="btn btn-danger me-2"
                        onClick={() => handleReject(appointment._id)}
                      >
                        Từ chối
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewDetail(appointment._id)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr key="no-appointments">
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
              Lịch hẹn đã được chuyển đến cho bác sĩ, kiểm tra tất cả lịch hẹn tại trang{" "}
              <Link
                to="/nurse/list"
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

export default NurseAssigned;