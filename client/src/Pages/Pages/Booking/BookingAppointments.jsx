import React from 'react';
import Section from '../../../Components/Section';
import PageHeading from '../../../Components/PageHeading';
import AppointmentForm from '../../../Components/AppointmentForm';

const AppointmentPage = () => {
  const headingData = {
    title: "Đặt Lịch Hẹn",
    subtitle: "Vui lòng điền đầy đủ thông tin để chúng tôi hỗ trợ bạn tốt nhất.",
  };

  return (
    <>
      <Section
        topSpaceMd="100"
      >
      </Section>

      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/banner-doctors.png"
      >
        <PageHeading data={headingData} />
      </Section>

      <Section className="cs_appointment_form_section">
        <AppointmentForm />
      </Section>
    </>
  );
};

export default AppointmentPage;
