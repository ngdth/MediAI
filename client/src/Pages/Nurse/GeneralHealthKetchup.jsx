import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

const GeneralHealthKetchup = () => {
  const [appointmentData, setAppointmentData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [expandedDoctors, setExpandedDoctors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const fetchAppointmentData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("API Response:", response.data);
      setAppointmentData(response.data.data);
    } catch (error) {
      console.log("Error fetching appointment data:", error);
      console.error("Error fetching appointment data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vitalsData = appointmentData.vitals?.[0] || {};
      const testsData = appointmentData.tests?.[0] || {};

      const payload = {
        vitals: {
          pulse: vitalsData.pulse,
          bloodPressure: vitalsData.bloodPressure,
          temperature: vitalsData.temperature,
          weight: vitalsData.weight,
          height: vitalsData.height,
          generalCondition: vitalsData.generalCondition,
        },
        tests: {
          bloodTest: testsData.bloodTest,
          urineTest: testsData.urineTest,
          xRay: testsData.xRay,
          ultrasound: testsData.ultrasound,
          mri: testsData.mri,
          ecg: testsData.ecg,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}/update-nurse-fields`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      navigate("/nurse/pending");
    } catch (error) {
      console.error("Error updating nurse fields:", error);
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
      const payload = {};
      if (field === "vitals") {
        payload.vitals = { [subField]: updatedValue };
      } else if (field === "tests") {
        payload.tests = { [subField]: updatedValue };
      }

      await axios.put(
        `${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}/update-nurse-fields`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAppointmentData();
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleUploadImages = async (e, subField) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("testImages", file);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/test/upload/${appointmentId}/${subField}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload ảnh thành công:", response.data);
      toast.success("Upload ảnh " + subField + " thành công");
      e.target.value = null;
      fetchAppointmentData();
    } catch (error) {
      toast.error(`Upload ảnh ${subField} thất bại`);
      console.error("Upload thất bại:", error);
    }
  };

  const renderEditableField = (label, field, value, subField = null, showImageColumn = true) => {
    const isEditing = editMode[`${field}${subField || ""}`];
    const displayValue = value ? (typeof value === "object" ? JSON.stringify(value) : value) : "Chưa có dữ liệu";

    return (
      <tr>
        <td>{label}</td>
        <td>
          {isEditing ? (
            <input
              type={typeof value === "number" ? "number" : "text"}
              value={value || ""}
              onChange={(e) => handleInputChange(field, e.target.value, subField)}
              className="form-control"
            />
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
          {["xRay", "ultrasound", "mri", "ecg"].includes(subField) && (
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="d-none"
                id={`upload-${subField}`}
                onChange={(e) => handleUploadImages(e, subField)}
              />
              <label htmlFor={`upload-${subField}`} className="btn btn-sm btn-success mt-2">
                Thêm ảnh
              </label>
            </div>
          )}
        </td>
        {showImageColumn && (
          <td>
            {["xRay", "ultrasound", "mri", "ecg"].includes(subField) ? (
              <div>
                {appointmentData && appointmentData.tests && appointmentData.tests[0] && appointmentData.tests[0][subField + "Img"] ? (
                  appointmentData.tests[0][subField + "Img"].length > 0 ? (
                    <div className="image-grid">
                      {appointmentData.tests[0][subField + "Img"].map((imgPath, index) => (
                        <div className="image-container" key={index}>
                          <img src={imgPath} alt="Test image" />
                          <div className="image-actions">
                            <div className="zoom-icon-wrapper">
                              <FaSearch
                                className="icon zoom-icon"
                                onClick={() => setZoomedImage(imgPath)}
                              />
                            </div>
                            <div className="dots-icon-wrapper">
                              <HiOutlineDotsHorizontal
                                className="icon"
                                onClick={() => {
                                  setSelectedImageName(getImgName(imgPath));
                                  setIsModalOpen(true);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>Không có hình ảnh</span>
                  )
                ) : (
                  <span>Không có hình ảnh</span>
                )}
              </div>
            ) : (
              <span></span>
            )}
          </td>
        )}
      </tr>
    );
  };

  const getImgName = (path) => {
    return path.split('/').pop();
  };

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BE_URL}/test/delete/${appointmentId}/${selectedImageName}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchAppointmentData();
      setIsModalOpen(false);
      toast.success("Xóa ảnh thành công");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      toast.error("Xóa ảnh thất bại");
    }
  };

  const renderReadOnlyField = (label, value) => {
    let displayValue = value;
    if (label === "Giới tính") {
      displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
    } else if (label === "Ngày") {
      displayValue = value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có dữ liệu";
    } else if (label === "Lịch tái khám") {
      displayValue = value ? new Date(value).toLocaleDateString("vi-VN") : "Không có lịch tái khám";
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

  if (!appointmentData) {
    return <div>Đang tải...</div>;
  }

  const { appointment, prescriptions, vitals, tests, diagnosisDetails } = appointmentData;

  return (
    <div className="container">
      <h2 className="text-center mt-4">Thông tin chi tiết lịch hẹn</h2>

      <div className="mb-4">
        {/* Thông tin cơ bản - Chỉ đọc */}
        <h3 className="text-primary">Thông tin cơ bản</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {renderReadOnlyField("Tên bệnh nhân", appointment?.patientName)}
            {renderReadOnlyField("Tuổi", appointment?.age)}
            {renderReadOnlyField("Giới tính", appointment?.gender)}
            {renderReadOnlyField("Địa chỉ", appointment?.address)}
            {renderReadOnlyField("Email", appointment?.email)}
            {renderReadOnlyField("Số điện thoại", appointment?.phone)}
            {renderReadOnlyField("Ngày", appointment?.date)}
            {renderReadOnlyField("Giờ", appointment?.time)}
            {renderReadOnlyField("Triệu chứng", appointment?.symptoms)}
            {renderReadOnlyField("Trạng thái", appointment?.status)}
          </tbody>
        </table>

        {/* Thông tin khám thể lực - Có thể chỉnh sửa */}
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
            {renderEditableField("Mạch (số nhịp/phút)", "vitals", vitals?.[0]?.pulse, "pulse", false)}
            {renderEditableField("Huyết áp (mmHg)", "vitals", vitals?.[0]?.bloodPressure, "bloodPressure", false)}
            {renderEditableField("Nhiệt độ cơ thể (°C)", "vitals", vitals?.[0]?.temperature, "temperature", false)}
            {renderEditableField("Cân nặng (kg)", "vitals", vitals?.[0]?.weight, "weight", false)}
            {renderEditableField("Chiều cao (cm)", "vitals", vitals?.[0]?.height, "height", false)}
            {renderEditableField("Tình trạng chung", "vitals", vitals?.[0]?.generalCondition, "generalCondition", false)}
          </tbody>
        </table>

        {/* Tiền sử bệnh - Chỉ đọc */}
        <h3 className="text-primary">Tiền sử bệnh</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {renderReadOnlyField("Tiền sử cá nhân", appointment?.medicalHistory?.personal)}
            {renderReadOnlyField("Tiền sử gia đình", appointment?.medicalHistory?.family)}
          </tbody>
        </table>

        {/* Kết quả xét nghiệm - Có thể chỉnh sửa */}
        <h3 className="text-primary">Kết quả xét nghiệm</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Hành động</th>
              <th>Hình ảnh</th>
            </tr>
          </thead>
          <tbody>
            {renderEditableField("Xét nghiệm máu", "tests", tests?.[0]?.bloodTest, "bloodTest", false)}
            {renderEditableField("Xét nghiệm nước tiểu", "tests", tests?.[0]?.urineTest, "urineTest", false)}
            {renderEditableField("X-quang", "tests", tests?.[0]?.xRay, "xRay", true)}
            {renderEditableField("Siêu âm", "tests", tests?.[0]?.ultrasound, "ultrasound", true)}
            {renderEditableField("MRI", "tests", tests?.[0]?.mri, "mri", true)}
            {renderEditableField("Điện tâm đồ", "tests", tests?.[0]?.ecg, "ecg", true)}
          </tbody>
        </table>

        {/* Các bác sĩ đã phụ trách - Chỉ đọc */}
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
                  <h5>Chi tiết chẩn đoán</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Chỉ số</th>
                        <th>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosisDetails &&
                        diagnosisDetails
                          .filter((dd) => dd.doctorId._id === doctor._id)
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
                      {prescriptions &&
                        prescriptions
                          .filter((p) => p.doctorId._id === doctor._id)
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
          <p>Chưa có bác sĩ phụ trách</p>
        )}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
          Lưu toàn bộ
        </button>
      </div>

      {zoomedImage && (
        <div className="zoomed-image-overlay" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoomed image" className="zoomed-image" />
          <button className="close-btn" onClick={() => setZoomedImage(null)}>
            ✕
          </button>
        </div>
      )}

      {isModalOpen && <div className="modal-overlay"></div>}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xóa ảnh</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa ảnh này?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteImage}>Xóa</Button>
          <Button variant="secondary" onClick={closeModal}>Hủy</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GeneralHealthKetchup;