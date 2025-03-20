import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NurseAssigned = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
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
      setAppointments(response.data.data);
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
      if (sortConfig.key === "patientName") {
        return sortConfig.direction === "asc"
          ? a.patientName.localeCompare(b.patientName)
          : b.patientName.localeCompare(a.patientName);
      }

      if (sortConfig.key === "symptoms") {
        return sortConfig.direction === "asc"
          ? a.symptoms.localeCompare(b.symptoms)
          : b.symptoms.localeCompare(a.symptoms);
      }

      if (sortConfig.key === "time") {
        const aDateOnly = new Date(a.date).toISOString().split("T")[0];
        const bDateOnly = new Date(b.date).toISOString().split("T")[0];
        const aDateTime = new Date(`${aDateOnly}T${a.time}:00`);
        const bDateTime = new Date(`${bDateOnly}T${b.time}:00`);

        if (isNaN(aDateTime.getTime()) || isNaN(bDateTime.getTime())) {
          console.error("Invalid date format:", aDateTime, bDateTime);
          return 0;
        }

        return sortConfig.direction === "asc"
          ? aDateTime - bDateTime
          : bDateTime - aDateTime;
      }

      if (sortConfig.key === "doctor") {
        const aDoctorName = doctors[a.doctorId?._id] || "";
        const bDoctorName = doctors[b.doctorId?._id] || "";
        return sortConfig.direction === "asc"
          ? aDoctorName.localeCompare(bDoctorName)
          : bDoctorName.localeCompare(aDoctorName);
      }

      return 0;
    });
    return sortableAppointments;
  }, [appointments, sortConfig, doctors]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/nurse/general-health/${appointmentId}`);
  };

  return (
    <div className="pending">
      <h2>Pending Appointments</h2>
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
            sortedAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{appointment.patientName}</td>
                <td>
                  {new Date(appointment.date).toLocaleDateString("vi-VN")}{" "}
                  {appointment.time}
                </td>
                <td>{appointment.symptoms}</td>
                <td>{doctors[appointment.doctorId?._id] || "N/A"}</td>
                <td>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => updateAppointmentStatus(appointment._id, "Accepted")}
                  >
                    Xác nhận
                  </button>
                  <button
                    className="btn btn-danger"
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
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có lịch hẹn nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NurseAssigned;