import PageHeading from '../../Components/PageHeading';
import AppointmentSection from '../../Components/AppointmentSection';
import Section from '../../Components/Section';
import { useEffect, useState } from "react";
import axios from "axios";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllDoctors = async () => {
      let doctorArray = [];
      let hodArray = [];

      try {
        const doctorRes = await axios.get("http://localhost:8080/user/doctors");
        doctorArray = Array.isArray(doctorRes.data) ? doctorRes.data : (doctorRes.data ? [doctorRes.data] : []);
      } catch (error) {
        console.error("Error fetching doctors:", error.response?.data || error);
      }

      try {
        const hodRes = await axios.get("http://localhost:8080/user/hods");
        hodArray = Array.isArray(hodRes.data) ? hodRes.data : (hodRes.data ? [hodRes.data] : []);
      } catch (error) {
        console.error("Error fetching hods:", error.response?.data || error);
      }

      const combinedDoctors = [...doctorArray, ...hodArray];
      setDoctors(combinedDoctors);
      setLoading(false);
    };

    fetchAllDoctors();
  }, []);

  const headingData = {
    title: 'Our Doctors',
  };

  const appointmentSectionData = {
    subtitle: 'OUR TEAM MEMBER',
    title: 'Meet Our Specialist This<br> Doctor Meeting',
    doctorsData: doctors.map((doctor) => ({
      name: doctor.username,
      specialization: doctor.specialization,
      imageUrl: doctor.imageUrl,
      profileLink: `/doctors/${doctor._id}`,
      iconUrl: 'https://www.facebook.com/',
      iconUrl2: 'https://www.pinterest.com/',
      iconUrl3: 'https://www.twitter.com/',
    })),
  };

  return (
    <>
      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={headingData} />
      </Section>
      {/* Appointment Section */}
      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
      >
        <AppointmentSection data={appointmentSectionData} />
      </Section>
    </>
  );
};

export default DoctorsPage;
