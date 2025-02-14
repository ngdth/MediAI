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
  FaHeart,
} from 'react-icons/fa6';
import TeamSection from '../../Components/TeamSection';
import Section from '../../Components/Section';

const DoctorsDetailsPage = () => {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { doctorId } = useParams(); // Lấy id bác sĩ từ URL
  const [favoriteStatus, setFavoriteStatus] = useState(false); // Thêm khai báo trạng thái này

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

  const handleAddFavorite = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/favorites/add/${doctorId}`);
      console.log("Favorite Doctor Added:", response.data);
      setFavoriteStatus(true); // Cập nhật trạng thái yêu thích
    } catch (error) {
      console.error("Error adding favorite doctor:", error.response?.data || error);
    }
  };

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
    sliderData: doctorDetails.team || [],
  };

  const doctorInfo = [
    {
      icon: <FaLocationDot />,
      title: 'Location',
      subtitle: doctorDetails.location,
      secIcon: <FaEnvelope />,
      secTitle: 'E-mail:',
      secSubtitle: doctorDetails.email,
    },
    {
      icon: <FaCertificate />,
      title: 'Qualification',
      subtitle: doctorDetails.qualification,
      secIcon: <FaGlobe />,
      secTitle: 'Website',
      secSubtitle: doctorDetails.website,
    },
    {
      icon: <FaSuitcase />,
      title: 'Experience',
      subtitle: doctorDetails.experience,
    },
  ];

  const progressBars = doctorDetails.skills;

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
        {/* Nút thêm vào danh sách yêu thích */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleAddFavorite}
            style={{
              padding: '10px 20px',
              backgroundColor: favoriteStatus ? 'green' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            disabled={favoriteStatus} // Khóa nút nếu đã thêm vào yêu thích
          >
            {favoriteStatus ? (
              <>
                <FaHeart style={{ marginRight: '5px' }} />
                Added to Favorites
              </>
            ) : (
              <>
                <FaHeart style={{ marginRight: '5px' }} />
                Add to Favorites
              </>
            )}
          </button>
        </div>
      </Section>

      <Section topSpaceLg="80" topSpaceMd="110">
        <TeamSection variant={'cs_pagination cs_style_2'} data={teamData} />
      </Section>
    </>
  );
};

export default DoctorsDetailsPage;
