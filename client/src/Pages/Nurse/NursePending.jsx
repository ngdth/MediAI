import React, { useState, useEffect } from "react";
import axios from "axios";

const NursePending = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments("Pending");
    fetchDoctors();
  }, []);

  const fetchAppointments = async (status) => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(response.data.data);  // Assuming API returns data in response.data.data
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
      setDoctors(response.data); // Assuming doctors data is directly under response.data
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  // Hàm cập nhật trạng thái cuộc hẹn (Assign hoặc Reject)
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Appointment status updated successfully", status);
      fetchAppointments();  // Refresh the appointment list after updating status
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  // Hàm gán bác sĩ cho cuộc hẹn
  const assignDoctor = async (id, doctorId) => {
    try {
      await axios.put(`http://localhost:8080/appointment/${id}/assign`, { doctorId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchAppointments();  // Refresh the appointment list after assigning doctor
    } catch (error) {
      console.error("Error assigning doctor:", error);
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
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Symptoms</th>
              <th>Doctor</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.patientName}</td>
                  <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.symptoms}</td>
                  <td>
                    <select className="form-select" onChange={(e) => assignDoctor(appointment._id, e.target.value)}>
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.username} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-success me-2" onClick={() => updateAppointmentStatus(appointment._id, "Assigned")}>
                      Xác nhận
                    </button>
                    <button className="btn btn-danger" onClick={() => updateAppointmentStatus(appointment._id, "Rejected")}>
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Không có lịch hẹn nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NursePending;
