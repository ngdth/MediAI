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
      <h2 className="text-center mb-4">Kết quả khám bệnh</h2>
      
      {/* Thông tin bệnh nhân */}
      <div>
        <strong>Patient:</strong> {appointment.patientName}
        <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
      </div>

      {/* Thông tin khám bệnh (Bảng) */}
      <div className="mb-4">
        <h3 className="text-primary">Thông tin khám bệnh</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mạch</td>
              <td>
                <input
                  type="text"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  placeholder="Mạch"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Huyết áp</td>
              <td>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  placeholder="Huyết áp"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Nhiệt độ cơ thể</td>
              <td>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  placeholder="Nhiệt độ cơ thể"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Cân nặng</td>
              <td>
                <input
                  type="text"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  placeholder="Cân nặng"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Chiều cao</td>
              <td>
                <input
                  type="text"
                  value={vitals.height}
                  onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                  placeholder="Chiều cao"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Tình trạng chung</td>
              <td>
                <textarea
                  value={vitals.generalCondition}
                  onChange={(e) => setVitals({ ...vitals, generalCondition: e.target.value })}
                  placeholder="Tình trạng chung"
                  className="form-control"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Xét nghiệm (Bảng) */}
      <div className="mb-4">
        <h3 className="text-primary">Xét nghiệm</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Xét nghiệm</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xét nghiệm máu</td>
              <td>
                <textarea
                  value={tests.bloodTest}
                  onChange={(e) => setTests({ ...tests, bloodTest: e.target.value })}
                  placeholder="Xét nghiệm máu"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Xét nghiệm nước tiểu</td>
              <td>
                <textarea
                  value={tests.urineTest}
                  onChange={(e) => setTests({ ...tests, urineTest: e.target.value })}
                  placeholder="Xét nghiệm nước tiểu"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>X-quang</td>
              <td>
                <textarea
                  value={tests.xRay}
                  onChange={(e) => setTests({ ...tests, xRay: e.target.value })}
                  placeholder="X-quang"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Siêu âm</td>
              <td>
                <textarea
                  value={tests.ultrasound}
                  onChange={(e) => setTests({ ...tests, ultrasound: e.target.value })}
                  placeholder="Siêu âm"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>MRI</td>
              <td>
                <textarea
                  value={tests.mri}
                  onChange={(e) => setTests({ ...tests, mri: e.target.value })}
                  placeholder="MRI"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Điện tâm đồ</td>
              <td>
                <textarea
                  value={tests.ecg}
                  onChange={(e) => setTests({ ...tests, ecg: e.target.value })}
                  placeholder="Điện tâm đồ"
                  className="form-control"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Chẩn đoán bệnh (Bảng) */}
      <div className="mb-4">
        <h3 className="text-primary">Chẩn đoán bệnh</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chẩn đoán</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tên bệnh</td>
              <td>
                <input
                  type="text"
                  value={diagnosisDetails.diseaseName}
                  onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, diseaseName: e.target.value })}
                  placeholder="Tên bệnh"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Mức độ nghiêm trọng</td>
              <td>
                <input
                  type="text"
                  value={diagnosisDetails.severity}
                  onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, severity: e.target.value })}
                  placeholder="Mức độ nghiêm trọng"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Kết luận và hướng điều trị</td>
              <td>
                <textarea
                  value={diagnosisDetails.treatmentPlan}
                  onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, treatmentPlan: e.target.value })}
                  placeholder="Kết luận và hướng điều trị"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Lịch tái khám</td>
              <td>
                <input
                  type="text"
                  value={diagnosisDetails.followUpSchedule}
                  onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, followUpSchedule: e.target.value })}
                  placeholder="Lịch tái khám"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Chỉ định đặc biệt</td>
              <td>
                <textarea
                  value={diagnosisDetails.specialInstructions}
                  onChange={(e) => setDiagnosisDetails({ ...diagnosisDetails, specialInstructions: e.target.value })}
                  placeholder="Chỉ định đặc biệt"
                  className="form-control"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Tạo kết quả khám bệnh
        </button>
      </div>
    </div>
  );
};

export default ManageResult;
