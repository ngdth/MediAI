import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NurseAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
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
  }, [appointments, sortConfig]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/nurse/general-health/${appointmentId}`);
  };

  return (
    <div className="pending">
      <h2>All Appointments</h2>
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
                  onClick={() => handleSort("status")}
                  style={{ cursor: "pointer" }}
                >
                  Status{" "}
                  {sortConfig.key === "status" &&
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
                  .map((doctor) => doctor.username)
                  .join(", ");

                return (
                  <tr key={appointment._id}>
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
                        View Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr key="no-appointments">
                <td colSpan="5">No appointments available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NurseAppointmentList;
