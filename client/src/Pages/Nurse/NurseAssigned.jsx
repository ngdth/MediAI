import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RejectModal from "../../Components/Nurse/RejectModal";

const NurseAssigned = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments("Assigned");
    fetchDoctors();
  }, []);

  const fetchAppointments = async (status) => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("API response:", response.data);
      setAppointments(response.data.data || []); // Đảm bảo luôn là mảng
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/doctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const doctorMap = {};
      response.data.forEach((doctor) => {
        doctorMap[doctor._id] = doctor.username;
      });
      setDoctors(doctorMap);
    } catch (error) {
      console.error("Error fetching doctors:", error);
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
      fetchAppointments("Assigned");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
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
        // Lấy tên bác sĩ từ mảng doctorId
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
      await updateAppointmentStatus(selectedAppointmentId, "Rejected"); // Cập nhật trạng thái thành 'Rejected'
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedAppointmentId(null); // Reset state sau khi từ chối thành công
      fetchAppointments("Pending"); // Refresh danh sách lịch hẹn
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
              <th>
                <span
                  onClick={() => handleSort("doctor")}
                  style={{ cursor: "pointer" }}
                >
                  Doctor{" "}
                  {sortConfig.key === "doctor" &&
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
                    <td>{doctorNames || "No doctor assigned"}</td>
                    <td>
                      <button
                        className="btn btn-success me-2"
                        onClick={() => updateAppointmentStatus(appointment._id, "Accepted")}
                      >
                        Xác nhận
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(appointment._id)}
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
    </div>
  );
};

export default NurseAssigned;
