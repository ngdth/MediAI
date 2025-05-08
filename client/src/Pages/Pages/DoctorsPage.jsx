import PageHeading from '../../Components/PageHeading';
import AppointmentSection from '../../Components/AppointmentSection';
import Section from '../../Components/Section';
import SectionHeading from '../../Components/SectionHeading';
import { useEffect, useState } from "react";
import axios from "axios";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllDoctors = async () => {
      let doctorArray = [];
      let hodArray = [];

      try {
        const doctorRes = await axios.get(`${import.meta.env.VITE_BE_URL}/user/doctors`);
        doctorArray = Array.isArray(doctorRes.data) ? doctorRes.data : (doctorRes.data ? [doctorRes.data] : []);
      } catch (error) {
        console.error("Error fetching doctors:", error.response?.data || error);
      }

      try {
        const hodRes = await axios.get(`${import.meta.env.VITE_BE_URL}/user/hods`);
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
    title: 'BÁC SĨ',
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedDoctors = filteredDoctors.reduce((groups, doctor) => {
    const specialization = doctor.specialization || "Other";
    if (!groups[specialization]) {
      groups[specialization] = [];
    }
    groups[specialization].push({
      name: doctor.username,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization,
      imageUrl: doctor.imageUrl,
      profileLink: `/doctors/${doctor._id}`,
      iconUrl: 'https://www.facebook.com/',
      iconUrl2: 'https://www.pinterest.com/',
      iconUrl3: 'https://www.twitter.com/',
    });
    return groups;
  }, {});

  const appointmentSectionData = {
    subtitle: 'TẤT CẢ CÁC BÁC SĨ',
    groupedDoctors,
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

      <Section
        topSpaceMd="50"
      >
      </Section>

      <SectionHeading
        SectionSubtitle={appointmentSectionData.subtitle}
        SectionTitle={appointmentSectionData.title}
        variant={"text-center"}
      />

      <Section
        topSpaceMd="30"
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ theo tên..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: '10px 15px',
              width: '80%',
              maxWidth: '500px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
          />
        </div>
      </Section>

      <Section>
        {loading ? (
          <p className="text-center">Đang tải dữ liệu...</p>
        ) : filteredDoctors.length === 0 ? (
          <p className="text-center fw-bold">Không tìm thấy bác sĩ nào.</p>
        ) : (
          <AppointmentSection
            data={appointmentSectionData}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}
      </Section>
    </>
  );
};

export default DoctorsPage;
