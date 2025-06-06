import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PageHeading from '../../Components/PageHeading';
import DoctorDetailsSection from '../../Components/DoctorDetailsSection';
import BookingForm from '../../Components/Doctor/BookingForm';
import {
  FaCertificate,
  FaEnvelope,
  FaSuitcase,
  FaPhone,
} from 'react-icons/fa6';
import Section from '../../Components/Section';
import { toast } from "react-toastify";
import { checkAuth } from '../../utils/validateUtils';

const DoctorsDetailsPage = () => {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { doctorId } = useParams();
  const [favoriteStatus, setFavoriteStatus] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorDetails(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          try {
            const hodResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/user/hod/${doctorId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setDoctorDetails(hodResponse.data);
          } catch (hodError) {
            console.error("Không tìm thấy bác sĩ hoặc trưởng khoa:", hodError.response?.data || hodError);
            setDoctorDetails(null);
          }
        } else {
          console.error("Lỗi khi fetch doctor:", error.response?.data || error);
          setDoctorDetails(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const checkIfFavorite = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BE_URL}/user/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favoriteDoctors = res.data.favorites || [];
        const isFavorite = favoriteDoctors.some((doc) => doc._id === doctorId);
        setFavoriteStatus(isFavorite);
      } catch (error) {
        console.error("Error checking favorite doctors:", error.response?.data || error);
      }
    };

    fetchDoctorDetails();
    checkIfFavorite();
  }, [doctorId, token]);

  const handleFavoriteToggle = async () => {
    checkAuth(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/user/favorites/add/${doctorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Doctor added to favorites:", response.data);
      toast.success("Thêm bác sĩ vào danh sách yêu thích thành công!");
      setFavoriteStatus(true);
    } catch (error) {
      console.error(error.response?.data || error);
      const errorMessage = error.response?.data?.message || "";

      if (errorMessage.includes("Doctor already in favorites")) {
        try {
          await axios.delete(`${import.meta.env.VITE_BE_URL}/user/favorites/delete/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log("Doctor removed from favorites.");
          toast.info("Xóa bác sĩ khỏi danh sách yêu thích thành công!");
          setFavoriteStatus(false);
        } catch (deleteError) {
          toast.error("Lỗi khi xóa bác sĩ khỏi danh sách yêu thích!");
          console.error("Error removing doctor from favorites:", deleteError.response?.data || deleteError);
        }
      } else {
        toast.error("Vui lòng đăng nhập!");
        console.error("Error adding doctor to favorites:", error.response?.data || error);
      }
    }
  }, navigate);
  };

  const handleBookingSubmit = (bookingData) => {
    console.log("Booking Data Submitted:", bookingData);
    toast.success("Đặt lịch hẹn thành công!");
    setShowBookingForm(false);
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  if (!doctorDetails) {
    return <p>Không tìm thấy bác sĩ</p>;
  }

  const headingData = {
    title: doctorDetails.name || "Chi Tiết Bác Sĩ",
  };

  const teamData = {
    subtitle: 'OUR TEAM MEMBER',
    title: ' Meet Our Specialist This <br />Doctor Meeting',
    sliderData: doctorDetails.team || [],
  };

  const handleBookingSuccess = (data) => {
    setBookingData(data);
    setShowPopup(true);
    setShowBookingForm(false);
    setTimeout(() => {
      setShowPopup(false);
    }, 15000);
  };

  const doctorInfo = [
    {
      icon: <FaCertificate />,
      title: 'Chuyên khoa',
      subtitle: doctorDetails.specialization,
      secIcon: <FaEnvelope />,
      secTitle: 'E-mail:',
      secSubtitle: doctorDetails.email,
    },
    {
      icon: <FaSuitcase />,
      title: 'Kinh nghiệm',
      subtitle: doctorDetails.experience,
      secIcon: <FaPhone />,
      secTitle: 'Số điện thoại',
      secSubtitle: doctorDetails.phone,
    },
  ];

  const progressBars = doctorDetails.skills;

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

      <Section topSpaceLg="80" topSpaceMd="120">
        <DoctorDetailsSection
          data={{ ...doctorDetails, info: doctorInfo, progressBars }}
          onFavoriteToggle={handleFavoriteToggle}
          favoriteStatus={favoriteStatus}
          onBookNow={() => {
            checkAuth(() => setShowBookingForm(true), navigate);
          }}
        />
      </Section>

      <BookingForm
        show={showBookingForm}
        doctorId={doctorId}
        onClose={() => setShowBookingForm(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <span className="close-btn" onClick={() => setShowPopup(false)}>✖</span>
            <div className="checkmark">✔</div>
            <h2>Đã đăng ký</h2>
            <p>
              Cảm ơn bạn đã đăng ký cuộc hẹn vào{" "}
              <b>
                {bookingData?.date ? new Date(bookingData.date).toLocaleDateString("vi-VN") : "Chưa chọn ngày"}{" "}
                {bookingData?.time}
              </b>.
              Chúng tôi sẽ sớm liên lạc với bạn trong vòng 24 giờ để xác nhận lịch hẹn. Xin cảm ơn.
            </p>
            <button className="btn-home" onClick={() => setShowPopup(false)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorsDetailsPage;