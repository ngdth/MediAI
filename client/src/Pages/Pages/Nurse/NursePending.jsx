import React, { useState, useEffect } from "react";
import axios from "axios";

const NursePending = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments("Pending");
  }, []);

  const fetchAppointments = async (status) => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
              <td>
                <button>Confirm</button>
                <button>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NursePending;
