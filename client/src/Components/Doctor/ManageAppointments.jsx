import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ManageAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorId(response.data.id);
      } catch (error) {
        console.error("Error fetching doctor ID:", error);
      }
    };

    fetchDoctorId();
  }, [token]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return; 

      try {
        const response = await axios.get(
          `http://localhost:8080/appointment?status=Accepted&doctorId=${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(response.data.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  return (
    <div className="container">
      <h2>Danh sách lịch hẹn</h2>
      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Symptoms</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.patientName}</td>
              <td>{appointment.symptoms}</td>
              <td>{new Date(appointment.date).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/doctor/appointments/manage-result/${appointment._id}`}
                  className="btn btn-primary"
                >
                  Tạo kết quả khám bệnh
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAppointment;