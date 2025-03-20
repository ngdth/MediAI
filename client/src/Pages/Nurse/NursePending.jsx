import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NursePending = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState({});
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
      setAppointments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/doctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Appointment status updated successfully", status);
      fetchAppointments("Pending");
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const assignDoctor = async (id) => {
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

      return 0;
    });
    return sortableAppointments;
  }, [appointments, sortConfig]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/nurse/general-health/${appointmentId}`);
  };
  
  return (
    <div className="pending">
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
              <th>Doctor</th>
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
                  <td>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedDoctor(doctors.find(doctor => doctor._id === e.target.value))}
                    >
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.username} - {doctor.specialization}
                        </option>
                      ))}
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
      )}
    </div>
  );
};

export default NursePending;