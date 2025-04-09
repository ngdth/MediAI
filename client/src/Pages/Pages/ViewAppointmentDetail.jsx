import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewAppointmentDetail = () => {
  const { appointmentId } = useParams(); // Lấy ID từ URL
  const [appointmentData, setAppointmentData] = useState(null);

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
      console.log("API Response:", response.data); // Kiểm tra dữ liệu trả về từ API
      setAppointmentData(response.data.data);
    } catch (error) {
      console.error("Error fetching appointment data:", error);
    }
  };

  const renderReadOnlyField = (label, value) => {
    let displayValue = value;
    if (label === "Giới tính") {
      displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
    } else if (label === "Ngày") {
      displayValue = value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có dữ liệu";
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

  const renderImageField = (label, value, images) => {
    return (
      <tr>
        <td>{label}</td>
        <td>{value || "Chưa có dữ liệu"}</td>
        <td>
          {images && images.length > 0 ? (
            <div className="image-grid" style={{ display: "flex", gap: "10px" }}>
              {images.map((imgPath, index) => (
                <img
                  key={index}
                  src={imgPath}
                  alt={`${label} image`}
                  style={{ width: "100px", height: "auto" }}
                  onError={(e) => {
                    e.target.src = "/path/to/placeholder.jpg"; // Hình ảnh dự phòng nếu không tải được
                    console.error(`Error loading image: ${imgPath}`);
                  }}
                />
              ))}
            </div>
          ) : (
            "Không có hình ảnh"
          )}
        </td>
      </tr>
    );
  };

  if (!appointmentData) {
    return <div>Loading...</div>;
  }

  const { appointment, prescriptions, vitals, tests, diagnosisDetails } = appointmentData;

  return (
    <>
      <Section
        className={"cs_page_heading cs_bg_filed cs_center"}
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={{ title: "Appointment Details" }} />
      </Section>

      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className="cs_appointment"
      >
        <div className="container">
          <SectionHeading
            SectionSubtitle="APPOINTMENT DETAILS"
            SectionTitle="View Your Appointment Information"
            variant={"text-center"}
          />
          <div className="cs_height_40 cs_height_lg_35" />

          <div className="mb-4">
            {/* Thông tin cơ bản */}
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

            {/* Thông tin khám thể lực */}
            <h3 className="text-primary">Thông tin khám thể lực</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  <th>Giá trị</th>
                </tr>
              </thead>
              <tbody>
                {renderReadOnlyField("Mạch (số nhịp/phút)", vitals?.[0]?.pulse)}
                {renderReadOnlyField("Huyết áp (mmHg)", vitals?.[0]?.bloodPressure)}
                {renderReadOnlyField("Nhiệt độ cơ thể (°C)", vitals?.[0]?.temperature)}
                {renderReadOnlyField("Cân nặng (kg)", vitals?.[0]?.weight)}
                {renderReadOnlyField("Chiều cao (cm)", vitals?.[0]?.height)}
                {renderReadOnlyField("Tình trạng chung", vitals?.[0]?.generalCondition)}
              </tbody>
            </table>

            {/* Tiền sử bệnh */}
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

            {/* Kết quả xét nghiệm */}
            <h3 className="text-primary">Kết quả xét nghiệm</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  <th>Giá trị</th>
                  <th>Hình ảnh</th>
                </tr>
              </thead>
              <tbody>
                {renderReadOnlyField("Xét nghiệm máu", tests?.[0]?.bloodTest)}
                {renderReadOnlyField("Xét nghiệm nước tiểu", tests?.[0]?.urineTest)}
                {renderImageField("X-quang", tests?.[0]?.xRay, tests?.[0]?.xRayImg)}
                {renderImageField("Siêu âm", tests?.[0]?.ultrasound, tests?.[0]?.ultrasoundImg)}
                {renderImageField("MRI", tests?.[0]?.mri, tests?.[0]?.mriImg)}
                {renderImageField("Điện tâm đồ", tests?.[0]?.ecg, tests?.[0]?.ecgImg)}
              </tbody>
            </table>

            {/* Các bác sĩ đã phụ trách */}
            <h3 className="text-primary">Các bác sĩ đã phụ trách</h3>
            {appointment?.doctorId && appointment.doctorId.length > 0 ? (
              appointment.doctorId.map((doctor) => (
                <div key={doctor._id} className="mb-3">
                  <h4 style={{ color: "#007bff" }}>{doctor.username}</h4>
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
                </div>
              ))
            ) : (
              <p>Chưa có bác sĩ phụ trách</p>
            )}
          </div>
        </div>
      </Section>
    </>
  );
};

export default ViewAppointmentDetail;