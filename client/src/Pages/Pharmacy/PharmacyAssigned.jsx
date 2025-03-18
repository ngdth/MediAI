import React, { useState, useEffect } from "react";
import axios from "axios";

const NurseAssigned = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});

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
        doctorMap[doctor._id] = doctor.username; // Dùng doctor._id làm key
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
      fetchAppointments();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return (
    <div className="pending">
      <h2>Pending Appointments</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Symptoms</th>
            <th>Doctor</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.patientName}</td>
              <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
              <td>{appointment.time}</td>
              <td>{appointment.symptoms}</td>
              <td>{doctors[appointment.doctorId._id]}</td>
              <td>
                <button className="btn btn-success me-2" onClick={() => updateAppointmentStatus(appointment._id, "Accepted")}>
                  Xác nhận
                </button>
                <button className="btn btn-danger me-2">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NurseAssigned;
