import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const GeneralHealthKetchup = () => {
  const [appointmentData, setAppointmentData] = useState(null); // Khởi tạo là null để kiểm tra loading
  const [editMode, setEditMode] = useState({});
  const [expandedDoctors, setExpandedDoctors] = useState({});
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const fetchAppointmentData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("API Response:", response.data); // Log để kiểm tra dữ liệu
      setAppointmentData(response.data.data); // Gán dữ liệu từ response.data.data
    } catch (error) {
      console.error("Error fetching appointment data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8080/appointment/${appointmentId}/createresult`,
        {
          vitals: appointmentData.vitals[0], // Lấy phần tử đầu tiên nếu là mảng
          tests: appointmentData.tests[0],
          diagnosisDetails: appointmentData.diagnosisDetails[0],
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate("/appointments");
    } catch (error) {
      console.error("Error updating appointment data:", error);
    }
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleDoctorExpansion = (doctorId) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const handleInputChange = async (field, value, subField = null) => {
    let updatedValue = value;
    if (field === "gender") {
      updatedValue = value === "Nam" ? "male" : value === "Nữ" ? "female" : value;
    }

    if (subField) {
      setAppointmentData((prev) => ({
        ...prev,
        [field]: [{ ...prev[field]?.[0], [subField]: updatedValue }],
      }));
    } else {
      setAppointmentData((prev) => ({
        ...prev,
        appointment: { ...prev.appointment, [field]: updatedValue },
      }));
    }

    try {
      await axios.put(
        `http://localhost:8080/appointment/${appointmentId}/update-field`,
        { field, subField, value: updatedValue },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAppointmentData();
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const renderField = (label, field, value, subField = null) => {
    const isEditing = editMode[`${field}${subField || ""}`];
    let displayValue = value;

    if (field === "gender") {
      displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
    } else {
      displayValue = value ? (typeof value === "object" ? JSON.stringify(value) : value) : "Chưa có dữ liệu";
    }

    return (
      <tr>
        <td>{label}</td>
        <td>
          {isEditing ? (
            field === "gender" && !subField ? (
              <select
                value={displayValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="form-control"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            ) : (
              <input
                type={typeof value === "number" ? "number" : "text"}
                value={field === "gender" ? displayValue : value || ""}
                onChange={(e) => handleInputChange(field, e.target.value, subField)}
                className="form-control"
              />
            )
          ) : (
            <span>{displayValue}</span>
          )}
        </td>
        <td>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => toggleEditMode(`${field}${subField || ""}`)}
          >
            {isEditing ? "Lưu" : "Thay đổi"}
          </button>
        </td>
      </tr>
    );
  };

  if (!appointmentData) {
    return <div>Loading...</div>; // Hiển thị loading khi dữ liệu chưa sẵn sàng
  }

  const { appointment, prescriptions, vitals, tests, diagnosisDetails } = appointmentData;

  return (
    <div className="container">
      <h2 className="text-center mt-4">Thông tin chi tiết lịch hẹn</h2>

      <div className="mb-4">
        {/* Thông tin cơ bản */}
        <h3 className="text-primary">Thông tin cơ bản</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Tên bệnh nhân", "patientName", appointment?.patientName)}
            {renderField("Tuổi", "age", appointment?.age)}
            {renderField("Giới tính", "gender", appointment?.gender)}
            {renderField("Địa chỉ", "address", appointment?.address)}
            {renderField("Email", "email", appointment?.email)}
            {renderField("Số điện thoại", "phone", appointment?.phone)}
            {renderField("Ngày", "date", appointment?.date ? new Date(appointment.date).toLocaleDateString("vi-VN") : "")}
            {renderField("Giờ", "time", appointment?.time)}
            {renderField("Triệu chứng", "symptoms", appointment?.symptoms)}
            {renderField("Trạng thái", "status", appointment?.status)}
          </tbody>
        </table>

        {/* Thông tin khám thể lực */}
        <h3 className="text-primary">Thông tin khám thể lực</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Mạch (số nhịp/phút)", "vitals", vitals?.[0]?.pulse, "pulse")}
            {renderField("Huyết áp (mmHg)", "vitals", vitals?.[0]?.bloodPressure, "bloodPressure")}
            {renderField("Nhiệt độ cơ thể (°C)", "vitals", vitals?.[0]?.temperature, "temperature")}
            {renderField("Cân nặng (kg)", "vitals", vitals?.[0]?.weight, "weight")}
            {renderField("Chiều cao (cm)", "vitals", vitals?.[0]?.height, "height")}
            {renderField("Tình trạng chung", "vitals", vitals?.[0]?.generalCondition, "generalCondition")}
          </tbody>
        </table>

        {/* Tiền sử bệnh */}
        <h3 className="text-primary">Tiền sử bệnh</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Tiền sử cá nhân", "medicalHistory", appointment?.medicalHistory?.personal, "personal")}
            {renderField("Tiền sử gia đình", "medicalHistory", appointment?.medicalHistory?.family, "family")}
          </tbody>
        </table>

        {/* Kết quả xét nghiệm */}
        <h3 className="text-primary">Kết quả xét nghiệm</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Xét nghiệm máu", "tests", tests?.[0]?.bloodTest, "bloodTest")}
            {renderField("Xét nghiệm nước tiểu", "tests", tests?.[0]?.urineTest, "urineTest")}
            {renderField("X-quang", "tests", tests?.[0]?.xRay, "xRay")}
            {renderField("Siêu âm", "tests", tests?.[0]?.ultrasound, "ultrasound")}
            {renderField("MRI", "tests", tests?.[0]?.mri, "mri")}
            {renderField("Điện tâm đồ", "tests", tests?.[0]?.ecg, "ecg")}
          </tbody>
        </table>

        {/* Các bác sĩ đã phụ trách */}
        <h3 className="text-primary">Các bác sĩ đã phụ trách</h3>
        {appointment?.doctorId && appointment.doctorId.length > 0 ? (
          appointment.doctorId.map((doctor) => (
            <div key={doctor._id} className="mb-3">
              <h4
                onClick={() => toggleDoctorExpansion(doctor._id)}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                {doctor.username} {expandedDoctors[doctor._id] ? "↓" : "→"}
              </h4>
              {expandedDoctors[doctor._id] && (
                <div className="ml-3">
                  {/* Chi tiết chẩn đoán */}
                  <h5>Chi tiết chẩn đoán</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Chỉ số</th>
                        <th>Giá trị</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosisDetails && diagnosisDetails.filter(dd => dd.doctorId._id === doctor._id).map((dd, index) => (
                        <React.Fragment key={index}>
                          {renderField("Tên bệnh", "diagnosisDetails", dd.diseaseName, "diseaseName")}
                          {renderField("Mức độ nghiêm trọng", "diagnosisDetails", dd.severity, "severity")}
                          {renderField("Kế hoạch điều trị", "diagnosisDetails", dd.treatmentPlan, "treatmentPlan")}
                          {renderField("Lịch tái khám", "diagnosisDetails", dd.followUpSchedule, "followUpSchedule")}
                          {renderField("Hướng dẫn đặc biệt", "diagnosisDetails", dd.specialInstructions, "specialInstructions")}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Đơn thuốc */}
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
                      {prescriptions && prescriptions.filter(p => p.doctorId._id === doctor._id).map((presc, index) => (
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
          <p>Chưa có bác sĩ phụ trách</p>
        )}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
          Lưu toàn bộ
        </button>
      </div>
    </div>
  );
};

export default GeneralHealthKetchup;