import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Section from "../../Components/Section";
import PageHeading from "../../Components/PageHeading";

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      const data = [
        {
          id: 1,
          patient: "Nguyễn Văn A",
          date: "10/02/2025 09:00",
          status: "Waiting",
          note: "Khám tổng quát",
        },
        {
          id: 2,
          patient: "Trần Thị B",
          date: "12/02/2025 14:00",
          status: "In Progress",
          note: "Tái khám sau phẫu thuật",
        },
        {
          id: 3,
          patient: "Lê Văn C",
          date: "15/02/2025 11:00",
          status: "Completed",
          note: "Kiểm tra sức khỏe định kỳ",
        },
      ];
      const selectedAppointment = data.find((appt) => appt.id === parseInt(id));
      setAppointment(selectedAppointment);
    };

    fetchAppointmentDetail();
  }, [id]);
// tessting
  if (!appointment) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section
        className="cs_page_heading cs_bg_filed cs_center"
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={{ title: "Appointment Details" }} />
      </Section>
      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
      >
        <div className="container">
          <h3>Patient: {appointment.patient}</h3>
          <p>Date: {appointment.date}</p>
          <p>Status: {appointment.status}</p>
          <p>Note: {appointment.note}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </Section>
    </>
  );
};

export default AppointmentDetail;
