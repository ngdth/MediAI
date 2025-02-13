import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import { useState } from "react";
import { useParams } from "react-router-dom";

const UpdateAppointment = () => {
  const { appointmentId } = useParams(); // Lấy ID từ URL

  // Dữ liệu giả lập (Lấy từ API)
  const [appointment, setAppointment] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    number: "0987654321",
    service: "cardiology",
    date: "2025-02-10T14:00",
  });

  const services = [
    { value: "choose-service", label: "Choose Service" },
    { value: "crutches", label: "Crutches" },
    { value: "x-Ray", label: "X-Ray" },
    { value: "pulmonary", label: "Pulmonary" },
    { value: "cardiology", label: "Cardiology" },
    { value: "dental-care", label: "Dental Care" },
    { value: "neurology", label: "Neurology" },
  ];

  const handleChange = (e) => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cập nhật thành công!");
  };

 

  return (
    <>
      <Section
        className={"cs_page_heading cs_bg_filed cs_center"}
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={{ title: "Update Appointment" }} />
      </Section>

      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className="cs_appointment"
      >
        <div className="container">
          <div className="cs_appointment_form_wrapper">
            <SectionHeading
              SectionSubtitle="UPDATE APPOINTMENT"
              SectionTitle="Edit Your Appointment Details"
              variant={"text-center"}
            />
            <div className="cs_height_40 cs_height_lg_35" />
            <form
              className="cs_appointment_form row cs_gap_y_30"
              onSubmit={handleSubmit}
            >
              <div className="col-md-12">
                <input
                  type="text"
                  name="name"
                  value={appointment.name}
                  onChange={handleChange}
                  className="cs_form_field"
                  placeholder="Name"
                />
              </div>

              <div className="col-md-12">
                <input
                  type="email"
                  name="email"
                  value={appointment.email}
                  onChange={handleChange}
                  className="cs_form_field"
                  placeholder="Email"
                />
              </div>

              <div className="col-md-12">
                <input
                  type="text"
                  name="number"
                  value={appointment.number}
                  onChange={handleChange}
                  className="cs_form_field"
                  placeholder="Phone Number"
                />
              </div>

           
              <div className="col-md-12">
                <select
                  name="service"
                  value={appointment.service}
                  onChange={handleChange}
                  className="cs_form_field"
                >
                  {services.map((service, index) => (
                    <option value={service.value} key={index}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-12">
                <input
                  type="datetime-local"
                  name="date"
                  value={appointment.date}
                  onChange={handleChange}
                  className="cs_form_field"
                />
              </div>

             
              <div className="col-md-12">
                <button
                  type="submit"
                  className="cs_btn cs_style_1 cs_white_color"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
};

export default UpdateAppointment;
