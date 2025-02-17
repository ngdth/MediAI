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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorsDetailsPage = () => {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { doctorId } = useParams(); // Lấy id bác sĩ từ URL
  const [favoriteStatus, setFavoriteStatus] = useState(false); // Thêm khai báo trạng thái này

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
        });
        setDoctorDetails(response.data); // Lưu thông tin bác sĩ vào state
      } catch (error) {
        console.error("Error fetching doctor details:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId, token]);

  const handleFavoriteToggle = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/user/favorites/add/${doctorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Doctor added to favorites:", response.data);
      toast.success("Doctor added to favorites!");
      setFavoriteStatus(true);
    } catch (error) {
      console.error(error.response?.data || error);
      const errorMessage = error.response?.data?.message || "";

      if (errorMessage.includes("Doctor already in favorites")) {
        try {
          await axios.delete(`http://localhost:8080/user/favorites/delete/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("Doctor removed from favorites.");
          toast.info("Doctor removed from favorites!");
          setFavoriteStatus(false);
        } catch (deleteError) {
          toast.error("Error removing doctor from favorites!");
          console.error("Error removing doctor from favorites:", deleteError.response?.data || deleteError);
        }
      } else {
        toast.error("Please login!");
        console.error("Error adding doctor to favorites:", error.response?.data || error);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

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
        <DoctorDetailsSection
          data={{ ...doctorDetails, info: doctorInfo, progressBars }}
          onFavoriteToggle={handleFavoriteToggle}
          favoriteStatus={favoriteStatus}
        />
      </Section>

      <Section topSpaceLg="80" topSpaceMd="110">
        <TeamSection variant={'cs_pagination cs_style_2'} data={teamData} />
      </Section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default DoctorsDetailsPage;
