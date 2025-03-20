import React, { useState, useEffect } from "react";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
=======
import { useNavigate } from "react-router-dom";
>>>>>>> d9cea62507f634f817503beac555e21a1181a9c2

const NurseAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
<<<<<<< HEAD
  const navigate = useNavigate(); // Khởi tạo useNavigate
=======
  const navigate = useNavigate();
>>>>>>> d9cea62507f634f817503beac555e21a1181a9c2

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/appointment/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Appointments data:", response.data.data);
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
      const doctorMap = {};
      response.data.forEach((doctor) => {
        doctorMap[doctor._id] = doctor.username;
      });
      console.log("Doctors data:", doctorMap);
      setDoctors(doctorMap);
    } catch (error) {
      console.error("Error fetching doctors:", error);
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

      if (sortConfig.key === "status") {
        return sortConfig.direction === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
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
        const aDoctorId = typeof a.doctorId === "object" ? a.doctorId?._id : a.doctorId;
        const bDoctorId = typeof b.doctorId === "object" ? b.doctorId?._id : b.doctorId;
        const aDoctorName = doctors[aDoctorId] || "";
        const bDoctorName = doctors[bDoctorId] || "";
        return sortConfig.direction === "asc"
          ? aDoctorName.localeCompare(bDoctorName)
          : bDoctorName.localeCompare(aDoctorName);
      }

      return 0;
    });
    return sortableAppointments;
  }, [appointments, sortConfig, doctors]);

  const handleViewDetail = (appointmentId) => {
<<<<<<< HEAD
    navigate(`/nurse/general-health/${appointmentId}`); // Điều hướng đến trang GeneralHealthKetchup với ID
=======
    navigate(`/nurse/general-health/${appointmentId}`);
>>>>>>> d9cea62507f634f817503beac555e21a1181a9c2
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
              sortedAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.patientName}</td>
                  <td>
                    {new Date(appointment.date).toLocaleDateString("vi-VN")}{" "}
                    {appointment.time}
                  </td>
                  <td>{appointment.status}</td>
                  <td>
                    {doctors[
                      typeof appointment.doctorId === "object"
                        ? appointment.doctorId?._id
                        : appointment.doctorId
                    ] || "N/A"}
                  </td>
                  <td>
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