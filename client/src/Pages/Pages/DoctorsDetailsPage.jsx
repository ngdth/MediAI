import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PageHeading from '../../Components/PageHeading';
import DoctorDetailsSection from '../../Components/DoctorDetailsSection';
import {
  FaCertificate,
  FaEnvelope,
  FaGlobe,
  FaLocationDot,
  FaSuitcase,
} from 'react-icons/fa6';
import TeamSection from '../../Components/TeamSection';
import Section from '../../Components/Section';

const DoctorsDetailsPage = () => {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { doctorId } = useParams(); // Lấy id bác sĩ từ URL

  // Kiểm tra nếu id không tồn tại trong URL
  if (!doctorId) {
    return <p>Error: Doctor ID is missing!</p>;
  }

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user/doctors/${doctorId}`);
        setDoctorDetails(response.data); // Lưu thông tin bác sĩ vào state
      } catch (error) {
        console.error("Error fetching doctor details:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  if (loading) {
    return <p>Loading...</p>; // Hiển thị loading nếu đang tải dữ liệu
  }

  // Nếu không có dữ liệu bác sĩ, hiển thị thông báo lỗi
  if (!doctorDetails) {
    return <p>Doctor not found</p>;
  }

  const headingData = {
    title: doctorDetails.name || "Doctor Details",
  };

  const teamData = {
    subtitle: 'OUR TEAM MEMBER',
    title: ' Meet Our Specialist This <br />Doctor Meeting',
    sliderData: doctorDetails.team || [], // Nếu có đội ngũ bác sĩ khác thì hiển thị
  };

  const doctorInfo = [
    {
      icon: <FaLocationDot />,
      title: 'Location',
      subtitle: doctorDetails.location || 'N/A',
      secIcon: <FaEnvelope />,
      secTitle: 'E-mail:',
      secSubtitle: doctorDetails.email || 'N/A',
    },
    {
      icon: <FaCertificate />,
      title: 'Qualification',
      subtitle: doctorDetails.qualification || 'N/A',
      secIcon: <FaGlobe />,
      secTitle: 'Website',
      secSubtitle: doctorDetails.website || 'N/A',
    },
    {
      icon: <FaSuitcase />,
      title: 'Experience',
      subtitle: doctorDetails.experience || 'N/A',
    },
  ];

  const progressBars = doctorDetails.skills || []; // Nếu có kỹ năng/progress bars thì hiển thị

  return (
    <>
      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={headingData} />
      </Section>

      <Section topSpaceLg="80" topSpaceMd="120">
        <DoctorDetailsSection data={{ ...doctorDetails, info: doctorInfo, progressBars }} />
      </Section>

      {/* Start Team Section */}
      <Section topSpaceLg="80" topSpaceMd="110">
        <TeamSection variant={'cs_pagination cs_style_2'} data={teamData} />
      </Section>

      {/* End Team Section */}
    </>
  );
};

export default DoctorsDetailsPage;
