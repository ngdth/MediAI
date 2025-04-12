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
      try {
        const [doctorRes, hodRes] = await Promise.all([
          axios.get("http://localhost:8080/user/doctors"),
          axios.get("http://localhost:8080/user/hods")
        ]);

        const doctorArray = Array.isArray(doctorRes.data) ? doctorRes.data : [];
        const hodArray = Array.isArray(hodRes.data) ? hodRes.data : [];

        const combinedDoctors = [...doctorArray, ...hodArray];
        console.log("Combined Doctors & HODs:", combinedDoctors);
        setDoctors(combinedDoctors);
      } catch (error) {
        console.error("Error fetching all doctors:", error.response?.data || error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
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
