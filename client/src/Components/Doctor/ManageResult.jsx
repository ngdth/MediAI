import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ManageResult = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState({});
  const [result, setResult] = useState("");
  const [prescription, setPrescription] = useState("");

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointment(response.data.data);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const handleSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:8080/appointment/${appointmentId}/diagnosis`,
        { diagnosis: result, prescription },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate(`/doctor`);
    } catch (error) {
      console.error("Error submitting result:", error);
    }
  };

  return (
    <div className="container">
      <h2>Quản lý kết quả khám bệnh</h2>
      <div>
        <strong>Patient:</strong> {appointment.patientName}
        <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
      </div>

      <div>
        <h3>Kết quả khám bệnh</h3>
        <textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Nhập kết quả khám bệnh" />
      </div>

      <div>
        <h3>Đơn thuốc</h3>
        <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Nhập đơn thuốc" />
      </div>

      <button onClick={handleSubmit} className="btn btn-primary">Tạo đơn thuốc</button>

      <Link to={`/doctor/appointments/assign-to-pharmacy/${appointmentId}`} className="btn btn-success mt-3">Assign to Pharmacy</Link>
    </div>
  );
};

export default ManageResult;
