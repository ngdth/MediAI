import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const NurseAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/appointment/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Appointments data:", response.data);
      setAppointments(response.data.data);
      setFilteredAppointments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter((item) => {
      const appointment = item.appointment;

      const patientMatch = appointment.patientName?.toLowerCase().includes(term);
      const doctorMatch = appointment.doctorId
        .map((doctor) => doctor.username.toLowerCase())
        .join(", ")
        .includes(term);
      const statusMatch = appointment.status?.toLowerCase().includes(term);
      const timeMatch = `${new Date(appointment.date)
        .toLocaleDateString("vi-VN")
        .toLowerCase()} ${appointment.time.toLowerCase()}`.includes(term);
      const idMatch = appointment._id?.toLowerCase().includes(term);

      return patientMatch || doctorMatch || statusMatch || timeMatch || idMatch;
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
    const sortableAppointments = [...filteredAppointments];
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

      if (sortConfig.key === "status") {
        return sortConfig.direction === "asc"
          ? appointmentA.status.localeCompare(appointmentB.status)
          : appointmentB.status.localeCompare(appointmentA.status);
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
          .map((doctor) => doctor.username)
          .join(", ");
        const bDoctorNames = appointmentB.doctorId
          .map((doctor) => doctor.username)
          .join(", ");
        return sortConfig.direction === "asc"
          ? aDoctorNames.localeCompare(bDoctorNames)
          : bDoctorNames.localeCompare(aDoctorNames);
      }

      return 0;
    });
    return sortableAppointments;
  }, [filteredAppointments, sortConfig]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/nurse/general-health/${appointmentId}`);
  };

  return (
    <div className="pending">
      <h2>Tất cả lịch hẹn</h2>

      <div className="search-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by ID, patient, doctor, status, or time..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
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
                  onClick={() => handleSort("status")}
                  style={{ cursor: "pointer" }}
                >
                  Trạng thái{" "}
                  {sortConfig.key === "status" &&
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
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((item) => {
                const appointment = item.appointment;
                const doctorNames = appointment.doctorId
                  .map((doctor) => doctor.username)
                  .join(", ");

                return (
                  <tr key={appointment._id}>
                    <td>{appointment._id}</td>
                    <td>{appointment.patientName}</td>
                    <td>
                      {new Date(appointment.date).toLocaleDateString("vi-VN")}{" "}
                      {appointment.time}
                    </td>
                    <td>{appointment.status}</td>
                    <td>{doctorNames || "No doctor assigned"}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewDetail(appointment._id)}
                      >
                        Chi tết
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
    </div>
  );
};

export default NurseAppointmentList;