import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ManageResult = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState({
    pulse: "",
    bloodPressure: "",
    temperature: "",
    weight: "",
    height: "",
    generalCondition: "",
  });
  const [tests, setTests] = useState({
    bloodTest: "",
    urineTest: "",
    xRay: "",
    ultrasound: "",
    mri: "",
    ecg: "",
  });
  const [diagnosisDetails, setDiagnosisDetails] = useState({
    diseaseName: "",
    severity: "", // Sẽ được chọn từ dropdown
    treatmentPlan: "",
    followUpSchedule: "", // Sẽ được chọn từ input date
    specialInstructions: "",
  });

  const token = localStorage.getItem("token");

  // Lấy doctorId từ thông tin người dùng hiện tại
  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorId(response.data.id);
      } catch (error) {
        console.error("Error fetching doctor ID:", error);
        setLoading(false);
      }
    };

    fetchDoctorId();
  }, [token]);

  // Lấy thông tin lịch hẹn
  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Appointment details:", response.data);
      setAppointment(response.data.data.appointment);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, doctorId]);

  const handleSubmit = async () => {
    console.log("Token before sending request:", token);
    console.log("Payload:", { vitals, tests, diagnosisDetails });
  
    if (!doctorId) {
      alert("Không thể xác định bác sĩ. Vui lòng đăng nhập lại.");
      return;
    }
  
    // Kiểm tra dữ liệu trước khi gửi
    if (
      !vitals.pulse ||
      !vitals.bloodPressure ||
      !vitals.temperature ||
      !vitals.weight ||
      !vitals.height ||
      !vitals.generalCondition ||
      !tests.bloodTest ||
      !tests.urineTest ||
      !tests.xRay ||
      !tests.ultrasound ||
      !tests.mri ||
      !tests.ecg ||
      !diagnosisDetails.diseaseName ||
      !diagnosisDetails.severity ||
      !diagnosisDetails.treatmentPlan ||
      !diagnosisDetails.followUpSchedule ||
      !diagnosisDetails.specialInstructions
    ) {
      alert("Vui lòng điền đầy đủ thông tin trước khi gửi.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8080/appointment/${appointmentId}/createresult`,
        { vitals, tests, diagnosisDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Kết quả khám bệnh đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating result:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi tạo kết quả khám bệnh.";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container">
        <p>Không tìm thấy lịch hẹn.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="text-center mb-4">Kết quả khám bệnh</h2>

      {/* Thông tin bệnh nhân */}
      <div>
        <strong>Patient:</strong> {appointment.patientName}
        <p>
          <strong>Symptoms:</strong> {appointment.symptoms}
        </p>
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
                  onChange={(e) =>
                    setDiagnosisDetails({ ...diagnosisDetails, diseaseName: e.target.value })
                  }
                  placeholder="Tên bệnh"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Mức độ nghiêm trọng</td>
              <td>
                <select
                  value={diagnosisDetails.severity}
                  onChange={(e) =>
                    setDiagnosisDetails({ ...diagnosisDetails, severity: e.target.value })
                  }
                  className="form-control"
                >
                  <option value="">Chọn mức độ nghiêm trọng</option>
                  <option value="mild">Nhẹ</option>
                  <option value="moderate">Trung bình</option>
                  <option value="severe">Nặng</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Kết luận và hướng điều trị</td>
              <td>
                <textarea
                  value={diagnosisDetails.treatmentPlan}
                  onChange={(e) =>
                    setDiagnosisDetails({ ...diagnosisDetails, treatmentPlan: e.target.value })
                  }
                  placeholder="Kết luận và hướng điều trị"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Lịch tái khám</td>
              <td>
                <input
                  type="date"
                  value={diagnosisDetails.followUpSchedule}
                  onChange={(e) =>
                    setDiagnosisDetails({ ...diagnosisDetails, followUpSchedule: e.target.value })
                  }
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Chỉ định đặc biệt</td>
              <td>
                <textarea
                  value={diagnosisDetails.specialInstructions}
                  onChange={(e) =>
                    setDiagnosisDetails({
                      ...diagnosisDetails,
                      specialInstructions: e.target.value,
                    })
                  }
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