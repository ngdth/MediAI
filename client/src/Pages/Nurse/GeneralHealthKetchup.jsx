import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const GeneralHealthKetchup = () => {
  const [appointmentData, setAppointmentData] = useState({});
  const [editMode, setEditMode] = useState({});
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
      setAppointmentData(response.data.data);
    } catch (error) {
      console.error("Error fetching appointment data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8080/appointment/${appointmentId}/createresult`,
        { vitals: appointmentData.vitals, tests: appointmentData.tests, diagnosisDetails: appointmentData.diagnosisDetails },
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

  const handleInputChange = async (field, value, subField = null) => {
    let updatedValue = value;
    if (field === "gender") {
      updatedValue = value === "Nam" ? "male" : value === "Nữ" ? "female" : value;
    }

    if (subField) {
      setAppointmentData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subField]: updatedValue },
      }));
    } else {
      setAppointmentData((prev) => ({ ...prev, [field]: updatedValue }));
    }

    // Gửi yêu cầu cập nhật từng trường lên server
    try {
      await axios.put(
        `http://localhost:8080/appointment/${appointmentId}/update-field`,
        { field, subField, value: updatedValue },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAppointmentData(); // Cập nhật lại dữ liệu sau khi lưu
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const renderField = (label, field, value, subField = null) => {
    const isEditing = editMode[`${field}${subField || ""}`];
    let displayValue = value;

    if (field === "gender") {
      displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
    } else if (field === "doctorId" && !subField) {
      displayValue = value?.username || "Chưa có dữ liệu"; // Hiển thị username của bác sĩ
    } else {
      displayValue = value ? (typeof value === "object" ? JSON.stringify(value) : value) : "Chưa có dữ liệu";
    }

    return (
      <tr>
        <td>{label}</td>
        <td>
          {isEditing ? (
            field === "prescription" && !subField ? (
              <textarea
                value={JSON.stringify(value || [])}
                onChange={(e) => handleInputChange(field, JSON.parse(e.target.value || "[]"))}
                className="form-control"
              />
            ) : field === "gender" && !subField ? (
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
                disabled={field === "doctorId" && !subField} // Không cho chỉnh sửa tên bác sĩ trực tiếp
              />
            )
          ) : (
            <span>{displayValue}</span>
          )}
        </td>
        <td>
          {field !== "doctorId" && (
            <button
              className="btn btn-sm btn-warning"
              onClick={() => toggleEditMode(`${field}${subField || ""}`)}
            >
              {isEditing ? "Lưu" : "Thay đổi"}
            </button>
          )}
        </td>
      </tr>
    );
  };

  const { patientName, age, gender, address, email, phone, date, time, symptoms, status, doctorId, prescription, vitals, tests, diagnosisDetails, medicalHistory } = appointmentData;

  return (
    <div className="container">
      <h2 className="text-center mt-4">Thông tin chi tiết lịch hẹn</h2>

      <div className="mb-4">
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
            {renderField("Tên bệnh nhân", "patientName", patientName)}
            {renderField("Tuổi", "age", age)}
            {renderField("Giới tính", "gender", gender)}
            {renderField("Địa chỉ", "address", address)}
            {renderField("Email", "email", email)}
            {renderField("Số điện thoại", "phone", phone)}
            {renderField("Ngày", "date", date ? new Date(date).toLocaleDateString("vi-VN") : "")}
            {renderField("Giờ", "time", time)}
            {renderField("Triệu chứng", "symptoms", symptoms)}
            {renderField("Trạng thái", "status", status)}
            {renderField("Tên bác sĩ", "doctorId", doctorId)}
          </tbody>
        </table>

        <h3 className="text-primary">Đơn thuốc</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Đơn thuốc", "prescription", prescription)}
          </tbody>
        </table>

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
            {renderField("Mạch (số nhịp/phút)", "vitals", vitals?.pulse, "pulse")}
            {renderField("Huyết áp (mmHg)", "vitals", vitals?.bloodPressure, "bloodPressure")}
            {renderField("Nhiệt độ cơ thể (°C)", "vitals", vitals?.temperature, "temperature")}
            {renderField("Cân nặng (kg)", "vitals", vitals?.weight, "weight")}
            {renderField("Chiều cao (cm)", "vitals", vitals?.height, "height")}
            {renderField("Tình trạng chung", "vitals", vitals?.generalCondition, "generalCondition")}
          </tbody>
        </table>

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
            {renderField("Xét nghiệm máu", "tests", tests?.bloodTest, "bloodTest")}
            {renderField("Xét nghiệm nước tiểu", "tests", tests?.urineTest, "urineTest")}
            {renderField("X-quang", "tests", tests?.xRay, "xRay")}
            {renderField("Siêu âm", "tests", tests?.ultrasound, "ultrasound")}
            {renderField("MRI", "tests", tests?.mri, "mri")}
            {renderField("Điện tâm đồ", "tests", tests?.ecg, "ecg")}
          </tbody>
        </table>

        <h3 className="text-primary">Chi tiết chẩn đoán</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {renderField("Tên bệnh", "diagnosisDetails", diagnosisDetails?.diseaseName, "diseaseName")}
            {renderField("Mức độ nghiêm trọng", "diagnosisDetails", diagnosisDetails?.severity, "severity")}
            {renderField("Kế hoạch điều trị", "diagnosisDetails", diagnosisDetails?.treatmentPlan, "treatmentPlan")}
            {renderField("Lịch tái khám", "diagnosisDetails", diagnosisDetails?.followUpSchedule, "followUpSchedule")}
            {renderField("Hướng dẫn đặc biệt", "diagnosisDetails", diagnosisDetails?.specialInstructions, "specialInstructions")}
          </tbody>
        </table>

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
            {renderField("Tiền sử cá nhân", "medicalHistory", medicalHistory?.personal, "personal")}
            {renderField("Tiền sử gia đình", "medicalHistory", medicalHistory?.family, "family")}
          </tbody>
        </table>
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