import { useState } from "react";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

// Dữ liệu demo: dịch vụ & bác sĩ
const servicesData = [
  {
    value: "crutches",
    label: "Crutches",
    doctors: [
      { value: "dr-smith", label: "Dr. Smith" },
      { value: "dr-johnson", label: "Dr. Johnson" },
    ],
  },
  {
    value: "x-ray",
    label: "X-Ray",
    doctors: [{ value: "dr-williams", label: "Dr. Williams" }],
  },
  {
    value: "pulmonary",
    label: "Pulmonary",
    doctors: [
      { value: "dr-lee", label: "Dr. Lee" },
      { value: "dr-hoang", label: "Dr. Hoang" },
    ],
  },
];

// Ví dụ lịch rảnh (time slots) của mỗi bác sĩ
const doctorSchedules = {
  "dr-smith": [
    { date: "2025-02-10", times: ["09:00 AM", "10:00 AM", "02:00 PM"] },
    { date: "2025-02-11", times: ["08:00 AM", "11:00 AM"] },
  ],
  "dr-johnson": [
    { date: "2025-02-10", times: ["01:00 PM", "03:00 PM"] },
  ],
  "dr-williams": [
    { date: "2025-02-12", times: ["09:00 AM", "10:30 AM"] },
  ],
  "dr-lee": [
    { date: "2025-02-10", times: ["08:30 AM", "09:30 AM", "02:00 PM"] },
    { date: "2025-02-13", times: ["08:00 AM", "11:00 AM", "03:00 PM"] },
  ],
  "dr-hoang": [
    { date: "2025-02-10", times: ["09:00 AM", "11:00 AM"] },
  ],
};

const Appointments = () => {
  const headingData = {
    title: "Appointments",
  };

  // Bước hiện tại
  const [step, setStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    seriousIllness: "",
    chronicDisease: "",
    allergy: "",
    service: "",
    doctor: "",
    selectedDate: "",
    selectedTime: "",
  });

  // Lấy danh sách bác sĩ theo service đã chọn
  const doctorsOfSelectedService =
    servicesData.find((service) => service.value === formData.service)
      ?.doctors || [];

  // Lấy lịch rảnh cho bác sĩ đã chọn
  const doctorSchedule = doctorSchedules[formData.doctor] || [];

  // Mảng các ngày rảnh
  const availableDates = doctorSchedule.map((item) => item.date);

  // Mảng các giờ rảnh (sau khi chọn ngày)
  let availableTimes = [];
  if (formData.selectedDate) {
    const schedule = doctorSchedule.find(
      (item) => item.date === formData.selectedDate
    );
    if (schedule) {
      availableTimes = schedule.times;
    }
  }

  // Điều hướng giữa các bước
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Cập nhật formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Data:", formData);
    toast.success("Đặt lịch thành công!");
  };

  // Step Indicator (ở dưới form)
  const StepIndicator = () => (
    <div
      className="cs_step_indicator"
      style={{
        display: "flex",
        justifyContent: "space-around",
        marginTop: "20px",
      }}
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="cs_step_indicator_item"
          style={{
            textAlign: "center",
            flex: 1,
            position: "relative",
            fontWeight: step === item ? "bold" : "normal",
            color: step >= item ? "#007bff" : "#999",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              lineHeight: "30px",
              borderRadius: "50%",
              backgroundColor: step >= item ? "#007bff" : "#ccc",
              color: "#fff",
              margin: "0 auto 5px",
            }}
          >
            {item}
          </div>
          <div>Step {item}</div>
        </div>
      ))}
    </div>
  );

  // UI cho từng bước
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Full Name
              </label>
              <input
                type="text"
                className="cs_form_field"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Email
              </label>
              <input
                type="email"
                className="cs_form_field"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Phone Number
              </label>
              <input
                type="text"
                className="cs_form_field"
                name="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Have you ever had any serious illness?
              </label>
              <input
                type="text"
                className="cs_form_field"
                name="seriousIllness"
                placeholder="Describe (if any)"
                value={formData.seriousIllness}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Are you currently undergoing treatment for any chronic disease?
              </label>
              <input
                type="text"
                className="cs_form_field"
                name="chronicDisease"
                placeholder="Describe (if any)"
                value={formData.chronicDisease}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Do you have any allergies to medications or food?
              </label>
              <input
                type="text"
                className="cs_form_field"
                name="allergy"
                placeholder="Describe (if any)"
                value={formData.allergy}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case 2:
        return (
          <div className="col-md-12">
            <label className="cs_form_label" style={{ fontWeight: "bold" }}>
              Select Service
            </label>
            <select
              className="cs_form_field"
              name="service"
              value={formData.service}
              onChange={handleInputChange}
            >
              <option value="">-- Select Service --</option>
              {servicesData.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 3:
        return (
          <div className="col-md-12">
            <label className="cs_form_label" style={{ fontWeight: "bold" }}>
              Select Doctor
            </label>
            <select
              className="cs_form_field"
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
            >
              <option value="">-- Select Doctor --</option>
              {doctorsOfSelectedService.map((doctor) => (
                <option key={doctor.value} value={doctor.value}>
                  {doctor.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 4:
        return (
          <>
            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Select Date
              </label>
              <select
                className="cs_form_field"
                name="selectedDate"
                value={formData.selectedDate}
                onChange={handleInputChange}
              >
                <option value="">-- Select Date --</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="cs_form_label" style={{ fontWeight: "bold" }}>
                Select Time
              </label>
              <select
                className="cs_form_field"
                name="selectedTime"
                value={formData.selectedTime}
                onChange={handleInputChange}
                disabled={!formData.selectedDate}
              >
                <option value="">-- Select Time --</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Section
        className="cs_page_heading cs_bg_filed cs_center"
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={headingData} />
      </Section>

      <Section className="cs_appointment">
        <div className="container">
          {/* Tăng marginTop để form lùi xuống phía dưới một chút */}
          <div
            className="cs_appointment_form_wrapper"
            style={{
              maxWidth: "900px",
              margin: "50px auto 0 auto", // Tăng margin-top (50px) để form cách tiêu đề
              padding: "20px",
            }}
          >
            <div className="text-center" style={{ marginBottom: "40px" }}>
              {/* Tăng thêm marginBottom để đẩy card xa hơn tiêu đề */}
              <SectionHeading
                SectionSubtitle="MAKE APPOINTMENTS"
                SectionTitle="Booking Now Appointments"
                variant="text-center"
              />
            </div>

            {/* Card bao quanh form */}
            <div
              className="cs_form_card"
              style={{
                background: "#fff",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                padding: "30px",
                position: "relative",
                marginBottom: "20px",
              }}
            >
              {/* Nội dung Form */}
              <form
                className="cs_appointment_form row cs_gap_y_30"
                onSubmit={handleSubmit}
                style={{ margin: 0 }}
              >
                {renderStep()}
              </form>

              {/* Các nút mũi tên ở giữa form */}
              <div
                className="cs_arrows_container text-center mt-4"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "30px",
                }}
              >
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="cs_btn cs_style_1 cs_icon_button"
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "10px",
                      borderRadius: "50%",
                      border: "none",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FaArrowLeft size={24} />
                  </button>
                )}

                {step < 4 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="cs_btn cs_style_1 cs_icon_button"
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "10px",
                      borderRadius: "50%",
                      border: "none",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FaArrowRight size={24} />
                  </button>
                )}
              </div>
            </div>

            {/* Step indicator ở dưới cùng */}
            <StepIndicator />

            {/* Nút Submit (chỉ hiện ở bước cuối) */}
            <div className="text-center mt-4">
              {step === 4 && (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="cs_btn cs_style_1 cs_white_color"
                  style={{
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                    padding: "10px 30px",
                    borderRadius: "25px",
                  }}
                >
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Appointments;
