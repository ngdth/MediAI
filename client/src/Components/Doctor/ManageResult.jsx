import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ManageResult = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState({});
  const [vitals, setVitals] = useState({
    pulse: '',
    bloodPressure: '',
    temperature: '',
    weight: '',
    height: '',
    generalCondition: '',
  });
  const [tests, setTests] = useState({
    bloodTest: '',
    urineTest: '',
    xRay: '',
    ultrasound: '',
    mri: '',
    ecg: '',
  });
  const [diagnosisDetails, setDiagnosisDetails] = useState({
    diseaseName: '',
    severity: '',
    treatmentPlan: '',
    followUpSchedule: '',
    specialInstructions: '',
  });

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
      const response = await axios.post(
        `http://localhost:8080/appointment/${appointmentId}/createresult`,
        { vitals, tests, diagnosisDetails },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Kết quả khám bệnh và đơn thuốc đã được tạo!');
    } catch (error) {
      console.error("Error creating result and prescription:", error);
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
        <h3>Thông tin khám bệnh</h3>
        <input
          type="text"
          value={vitals.pulse}
          onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
          placeholder="Mạch"
        />
        <input
          type="text"
          value={vitals.bloodPressure}
          onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
          placeholder="Huyết áp"
        />
        <input
          type="text"
          value={vitals.temperature}
          onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
          placeholder="Nhiệt độ cơ thể"
        />
        <input
          type="text"
          value={vitals.weight}
          onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
          placeholder="Cân nặng"
        />
        <input
          type="text"
          value={vitals.height}
          onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
          placeholder="Chiều cao"
        />
        <textarea
          value={vitals.generalCondition}
          onChange={(e) => setVitals({ ...vitals, generalCondition: e.target.value })}
          placeholder="Tình trạng chung"
        />

        <h3>Xét nghiệm</h3>
        <textarea
          value={tests.bloodTest}
          onChange={(e) => setTests({ ...tests, bloodTest: e.target.value })}
          placeholder="Xét nghiệm máu"
        />
        <textarea
          value={tests.urineTest}
          onChange={(e) => setTests({ ...tests, urineTest: e.target.value })}
          placeholder="Xét nghiệm nước tiểu"
        />
        <textarea
          value={tests.xRay}
          onChange={(e) => setTests({ ...tests, xRay: e.target.value })}
          placeholder="X-quang"
        />
        <textarea
          value={tests.ultrasound}
          onChange={(e) => setTests({ ...tests, ultrasound: e.target.value })}
          placeholder="Siêu âm"
        />
        <textarea
          value={tests.mri}
          onChange={(e) => setTests({ ...tests, mri: e.target.value })}
          placeholder="MRI"
        />
        <textarea
          value={tests.ecg}
          onChange={(e) => setTests({ ...tests, ecg: e.target.value })}
          placeholder="Điện tâm đồ"
        />

        <h3>Chẩn đoán bệnh</h3>
        <input
          type="text"
          value={diagnosisDetails.diseaseName}
          onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, diseaseName: e.target.value })}
          placeholder="Tên bệnh"
        />
        <input
          type="text"
          value={diagnosisDetails.severity}
          onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, severity: e.target.value })}
          placeholder="Mức độ nghiêm trọng"
        />
        <textarea
          value={diagnosisDetails.treatmentPlan}
          onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, treatmentPlan: e.target.value })}
          placeholder="Kết luận và hướng điều trị"
        />
        <input
          type="text"
          value={diagnosisDetails.followUpSchedule}
          onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, followUpSchedule: e.target.value })}
          placeholder="Lịch tái khám"
        />
        <textarea
          value={diagnosisDetails.specialInstructions}
          onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, specialInstructions: e.target.value })}
          placeholder="Chỉ định đặc biệt"
        />

        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Tạo kết quả khám bệnh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageResult;

