import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PageHeading from '../../Components/PageHeading';
import DoctorDetailsSection from '../../Components/DoctorDetailsSection';
// import BookingCalendar from '../../Components/Doctor/BookingCalendar';
import BookingForm from '../../Components/Doctor/BookingForm';
import {
  FaCertificate,
  FaEnvelope,
  FaGlobe,
  FaLocationDot,
  FaSuitcase,
  FaHeart,
  FaPhone,
} from 'react-icons/fa6';
import Section from '../../Components/Section';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from 'react-bootstrap';

const DoctorsDetailsPage = () => {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { doctorId } = useParams(); // Lấy id bác sĩ từ URL
  const [favoriteStatus, setFavoriteStatus] = useState(false); // Thêm khai báo trạng thái này
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorDetails(response.data);
      } catch (error) {
        // Nếu lỗi là 404 thì thử gọi API HOD
        if (error.response?.status === 404) {
          try {
            const hodResponse = await axios.get(`http://localhost:8080/user/hod/${doctorId}`, {
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

  const handleBookingSubmit = (bookingData) => {
    console.log("Booking Data Submitted:", bookingData);
    toast.success("Appointment booked successfully!");
    setShowBookingForm(false); // Đóng modal sau khi đặt lịch
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!doctorDetails) {
    return <p>Không tìm thấy bác sĩ</p>;
  }

  const headingData = {
    title: doctorDetails.name || "Doctor Details",
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
      icon: <FaPhone />,
      title: 'Số điện thoại',
      subtitle: doctorDetails.phone,
      secIcon: <FaGlobe />,
      secTitle: 'Website',
      secSubtitle: doctorDetails.website,
    },
    {
      icon: <FaSuitcase />,
      title: 'Kinh nghiệm',
      subtitle: doctorDetails.experience,
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
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={headingData} />
      </Section>

      <Section topSpaceLg="80" topSpaceMd="120">
        <DoctorDetailsSection
          data={{ ...doctorDetails, info: doctorInfo, progressBars }}
          onFavoriteToggle={handleFavoriteToggle}
          favoriteStatus={favoriteStatus}
          onBookNow={() => setShowBookingForm(true)}
        />
      </Section>
      {/* ✅ Popup BookingForm */}
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
      {/* <Section topSpaceLg="80" topSpaceMd="110">
        <BookingCalendar doctorId={doctorId} token={token} />
      </Section> */}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default DoctorsDetailsPage;