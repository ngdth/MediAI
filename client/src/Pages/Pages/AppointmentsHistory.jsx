import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const AppointmentsHistory = () => {
  const headingData = {
    title: "Lịch Sử Khám",
  };

  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!token) {
          throw new Error("Token not found in localStorage");
        }

        console.log("Fetching user details...");
        const response = await axios.get("http://localhost:8080/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User details response:", response.data);
        const fetchedUserId = response.data.id;
        setUserId(fetchedUserId);
      } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
        setError("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
        if (error.response?.status === 401 || error.message === "Token not found in localStorage") {
          navigate("/login");
        }
      }
    };

    fetchUserDetails();
  }, [token, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        console.log("Waiting for userId...");
        return;
      }

      try {
        console.log(`Fetching appointments for userId: ${userId}`);
        const response = await axios.get(`http://localhost:8080/appointment?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Appointments response:", response.data);
        const appointmentData = response.data.data || [];
        setAppointments(appointmentData);
      } catch (error) {
        console.error("Error fetching appointments:", error.response?.data || error.message);
        setError("Không thể tải lịch sử cuộc hẹn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId, token]);

  const handleView = (id) => {
    navigate(`/ViewAppointmentDetail/${id}`);
  };

  const handleCancel = (id) => {
    setSelectedAppointmentId(id);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!rejectReason.trim()) {
      Swal.fire("Lỗi!", "Vui lòng nhập lý do hủy lịch hẹn.", "error");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/appointment/${selectedAppointmentId}/cancel`,
        { rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Cancel appointment response:", response.data);

      Swal.fire("Đã hủy!", `Cuộc hẹn đã bị hủy.`, "success");

      const updatedAppointments = appointments.map((appointment) =>
        appointment.appointment._id === selectedAppointmentId
          ? {
              ...appointment,
              appointment: {
                ...appointment.appointment,
                status: "Canceled",
                rejectReason,
              },
            }
          : appointment
      );
      setAppointments(updatedAppointments);

      setShowCancelModal(false);
      setRejectReason("");
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error("Error canceling appointment:", error.response?.data || error.message);
      Swal.fire(
        "Lỗi!",
        error.response?.data?.message || "Không thể hủy cuộc hẹn. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setRejectReason("");
    setSelectedAppointmentId(null);
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("vi-VN");
    return `${formattedDate} ${time}`;
  };

  const getStatusDisplay = (status) => {
    if (status === "Pending") {
      return "Đang chờ bác sĩ";
    } else if (status === "Assigned") {
      return "Đang chờ xác nhận";
    }
    return status;
  };

  const getDoctorDisplay = (appointment) => {
    const status = appointment.appointment.status;
    if (status === "Pending") {
      return "Chưa có bác sĩ";
    } else if (status === "Assigned") {
      const doctors = appointment.appointment.doctorId;
      if (doctors && doctors.length > 0) {
        return doctors.map((doctor) => doctor.username).join(", ");
      }
      return "Không có bác sĩ";
    } else {
      const doctors = appointment.appointment.doctorId;
      if (doctors && doctors.length > 0) {
        return doctors.map((doctor) => doctor.username).join(", ");
      }
      return "Không có bác sĩ";
    }
  };

  const canCancel = (status) => {
    return status === "Pending" || status === "Assigned";
  };

  return (
    <>
      <Section
        topSpaceMd="100"
      >
      </Section>

      <Section
        className="cs_page_heading cs_bg_filed cs_center"
        backgroundImage="/assets/img/banner-doctors.png"
      >
        <PageHeading data={headingData} />
      </Section>
      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className="cs_appointment"
      >
        <div className="container">
          <div className="cs_appointment_form_wrapper">
            <SectionHeading
              SectionSubtitle="LỊCH SỬ ĐẶT KHÁM"
              // SectionTitle="Your Past Appointments"
              variant="text-center"
            />
            <div className="cs_height_40 cs_height_lg_35" />
            <div className="appointment-table">
              {loading ? (
                <p>Đang tải...</p>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Bác sĩ</th>
                      <th>Trạng thái</th>
                      <th>hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length > 0 ? (
                      appointments.map((item) => {
                        const appointment = item.appointment;
                        return (
                          <tr
                            key={appointment._id}
                            className={appointment.status.toLowerCase().replace(" ", "-")}
                          >
                            <td>
                              {formatDateTime(appointment.date, appointment.time)}
                            </td>
                            <td>{getDoctorDisplay(item)}</td>
                            <td>{getStatusDisplay(appointment.status)}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={() => handleView(appointment._id)}
                              >
                                Xem
                              </button>
                              {canCancel(appointment.status) && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleCancel(appointment._id)}
                                >
                                  Hủy
                                </button>
                              )}
                              <Link
                                to={`/videocall/${appointment.meetingCode}`}
                                className="btn btn-success btn-sm me-2"
                              >
                                Tham gia cuộc gọi
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4">Bạn chưa có lịch hẹn nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Modal để nhập lý do hủy */}
      {showCancelModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lý do hủy lịch hẹn</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rejectReason">Vui lòng nhập lý do hủy:</label>
                  <textarea
                    id="rejectReason"
                    className="form-control"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do hủy lịch hẹn..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Đóng
                </button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmCancel}>
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsHistory;