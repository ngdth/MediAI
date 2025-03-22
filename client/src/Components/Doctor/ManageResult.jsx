import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ManageResult = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState({});
  const [tests, setTests] = useState({});
  const [diagnosisDetails, setDiagnosisDetails] = useState({
    diseaseName: "",
    severity: "",
    treatmentPlan: "",
    followUpSchedule: "",
    specialInstructions: "",
  });

  const token = localStorage.getItem("token");

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

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;
      setAppointment(data.appointment);
      setVitals(data.vitals[0] || {});
      setTests(data.tests[0] || {});
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
    if (
      !diagnosisDetails.diseaseName ||
      !diagnosisDetails.severity ||
      !diagnosisDetails.treatmentPlan ||
      !diagnosisDetails.followUpSchedule ||
      !diagnosisDetails.specialInstructions
    ) {
      alert("Vui lòng điền đầy đủ thông tin chẩn đoán trước khi gửi.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/appointment/${appointmentId}/createresult`,
        { diagnosisDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Kết quả chẩn đoán đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating result:", error);
      alert("Có lỗi xảy ra khi tạo kết quả chẩn đoán.");
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

      <div>
        <strong>Patient:</strong> {appointment.patientName}
        <p>
          <strong>Symptoms:</strong> {appointment.symptoms}
        </p>
      </div>

      {/* Thông tin khám bệnh - Chỉ đọc */}
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
            <tr><td>Mạch</td><td>{vitals.pulse || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Huyết áp</td><td>{vitals.bloodPressure || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Nhiệt độ cơ thể</td><td>{vitals.temperature || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Cân nặng</td><td>{vitals.weight || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Chiều cao</td><td>{vitals.height || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Tình trạng chung</td><td>{vitals.generalCondition || "Chưa có dữ liệu"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Xét nghiệm - Chỉ đọc */}
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
            <tr><td>Xét nghiệm máu</td><td>{tests.bloodTest || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Xét nghiệm nước tiểu</td><td>{tests.urineTest || "Chưa có dữ liệu"}</td></tr>
            <tr><td>X-quang</td><td>{tests.xRay || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Siêu âm</td><td>{tests.ultrasound || "Chưa có dữ liệu"}</td></tr>
            <tr><td>MRI</td><td>{tests.mri || "Chưa có dữ liệu"}</td></tr>
            <tr><td>Điện tâm đồ</td><td>{tests.ecg || "Chưa có dữ liệu"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Chẩn đoán bệnh - Có thể chỉnh sửa */}
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

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Tạo kết quả khám bệnh
        </button>
      </div>
    </div>
  );
};

export default ManageResult;