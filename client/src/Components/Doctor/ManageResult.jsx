import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate, useParams } from "react-router-dom";

const ManageResult = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorRole, setDoctorRole] = useState(null);
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
  const [expandedDoctors, setExpandedDoctors] = useState({});
  const [allDiagnosisDetails, setAllDiagnosisDetails] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = response.data.id;
        setDoctorId(id);
        setDoctorRole(response.data.role);
        console.log("Current Doctor ID:", id);
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
      setAllDiagnosisDetails(data.diagnosisDetails || []); // Lấy chi tiết chẩn đoán
      setPrescriptions(data.prescriptions || []); // Lấy đơn thuốc
      console.log("Appointment Doctor IDs:", data.appointment.doctorId);
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
      if(doctorRole === "doctor") {
      navigate("/doctor/medical-result");
      } else { 
        navigate("/hod/medical-result");
      }
    } catch (error) {
      console.error("Error creating result:", error);
      alert("Có lỗi xảy ra khi tạo kết quả chẩn đoán.");
    }
  };

  const toggleDoctorExpansion = (doctorId) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const renderReadOnlyField = (label, value) => {
    let displayValue = value;
    if (label === "Giới tính") {
      displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
    } else if (label === "Ngày") {
      displayValue = value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có dữ liệu";
    } else if (label === "Lịch tái khám") {
      displayValue = value ? new Date(value).toISOString().split("T")[0] : "Chưa có dữ liệu";
    } else {
      displayValue = value || "Chưa có dữ liệu";
    }

    return (
      <tr>
        <td>{label}</td>
        <td>{displayValue}</td>
      </tr>
    );
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

  const currentDoctorIndex = appointment.doctorId.findIndex((doctor) => doctor._id === doctorId);
  console.log("Current Doctor Index:", currentDoctorIndex);
  const previousDoctors = currentDoctorIndex > 0 ? appointment.doctorId.slice(0, currentDoctorIndex) : [];

  const renderImages = (imagePaths) => {
    imagePaths = imagePaths || [];
    if (imagePaths.length === 0) {
      return <span>Không có hình ảnh</span>;
    }
    return imagePaths.map((path, index) => (
      <img key={index} src={path} style={{ width: '100px', height: '100px', margin: '5px' }} alt="Test Image" />
    ));
  };

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
              <th>Hình Ảnh</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Xét nghiệm máu</td><td>{tests.bloodTest || "Chưa có dữ liệu"}</td><td>{renderImages([])}</td></tr>
            <tr><td>Xét nghiệm nước tiểu</td><td>{tests.urineTest || "Chưa có dữ liệu"}</td><td>{renderImages([])}</td></tr>
            <tr><td>X-quang</td><td>{tests.xRay || "Chưa có dữ liệu"}</td><td>{renderImages(tests.xRayImg)}</td></tr>
            <tr><td>Siêu âm</td><td>{tests.ultrasound || "Chưa có dữ liệu"}</td><td>{renderImages(tests.ultrasoundImg)}</td></tr>
            <tr><td>MRI</td><td>{tests.mri || "Chưa có dữ liệu"}</td><td>{renderImages(tests.mriImg)}</td></tr>
            <tr><td>Điện tâm đồ</td><td>{tests.ecg || "Chưa có dữ liệu"}</td><td>{renderImages(tests.ecgImg)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Các bác sĩ đã phụ trách - Chỉ đọc */}
      <div className="mb-4">
        <h3 className="text-primary">Các bác sĩ đã phụ trách</h3>
        {previousDoctors.length > 0 ? (
          previousDoctors.map((doctor) => (
            <div key={doctor._id} className="mb-3">
              <h4
                onClick={() => toggleDoctorExpansion(doctor._id)}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                Bác sĩ: {doctor.username} {expandedDoctors[doctor._id] ? "↓" : "→"}
              </h4>
              {expandedDoctors[doctor._id] && (
                <div className="ml-3">
                  <h5>Chi tiết chẩn đoán</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Chỉ số</th>
                        <th>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDiagnosisDetails
                        .filter((dd) => dd.doctorId?._id === doctor._id)
                        .map((dd, index) => (
                          <React.Fragment key={index}>
                            {renderReadOnlyField("Tên bệnh", dd.diseaseName)}
                            {renderReadOnlyField("Mức độ nghiêm trọng", dd.severity)}
                            {renderReadOnlyField("Kế hoạch điều trị", dd.treatmentPlan)}
                            {renderReadOnlyField("Lịch tái khám", dd.followUpSchedule)}
                            {renderReadOnlyField("Hướng dẫn đặc biệt", dd.specialInstructions)}
                          </React.Fragment>
                        ))}
                    </tbody>
                  </table>

                  <h5>Đơn thuốc</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Tên thuốc</th>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                        <th>Cách dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions
                        .filter((p) => p.doctorId?._id === doctor._id)
                        .map((presc, index) => (
                          <tr key={index}>
                            <td>{presc.medicineName}</td>
                            <td>{presc.unit}</td>
                            <td>{presc.quantity}</td>
                            <td>{presc.usage}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Không có bác sĩ trước đó phụ trách.</p>
        )}
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
                  <option value="Nhẹ">Nhẹ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Nặng">Nặng</option>
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