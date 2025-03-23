import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import BookingSchedule from "./BookingSchedule";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const BookingForm = ({ show, doctorId, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    address: "",
    email: "",
    phone: "",
    symptoms: "",
    medicalHistory: "",
    familyMedicalHistory: "",
    doctorId,
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, user not logged in.");
          return;
        }

        const response = await axios.get("http://localhost:8080/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data.user || response.data;

        setFormData((prevData) => ({
          ...prevData,
          fullName: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          gender: user.gender === "Nam" ? "male" : user.gender === "Nữ" ? "female" : "other",
          age: user.birthday ? calculateAge(new Date(user.birthday)) : "",
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [doctorId]);

  const calculateAge = (birthday) => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập! Vui lòng đăng nhập để đặt lịch.");
      return;
    }

    if (!formData.fullName || !formData.age || !formData.gender || !formData.address || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!selectedDay || !selectedSlot) {
      toast.error("Vui lòng chọn ngày và giờ khám!");
      return;
    }

    const appointmentData = {
      patientName: formData.fullName,
      age: formData.age,
      gender: formData.gender,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      date: selectedDay,
      time: selectedSlot,
      symptoms: formData.symptoms,
      medicalHistory: formData?.medicalHistory,
      familyMedicalHistory: formData?.familyMedicalHistory,
      doctorId: formData.doctorId,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/appointment/book",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Đặt lịch thành công:", response.data);
      toast.success("Đặt lịch thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error.response?.data || error.message);
      // toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered scrollable dialogClassName="large-modal">
      <Modal.Header closeButton>
        <Modal.Title>Đặt lịch khám</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="row-cols-1 row-cols-md-2 g-3">
            {/* Cột 1 - Thông tin cá nhân */}
            <Col>
              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Họ và tên:</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Tuổi:</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Giới tính:</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Địa chỉ:</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Email:</Form.Label>
                <Form.Control
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Số điện thoại:</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Cột 2 - Thông tin khám bệnh */}
            <Col>
              <BookingSchedule
                doctorId={doctorId}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
              />

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Lý do khám:</Form.Label>
                <Form.Control
                  as="textarea"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Triệu chứng, khám định kỳ, kiểm tra sức khỏe..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Tiền sử bệnh lý:</Form.Label>
                <Form.Control
                  as="textarea"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Tiền sử bệnh lý (nếu có)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-start w-100">Tiền sử bệnh lý trong gia đình:</Form.Label>
                <Form.Control
                  as="textarea"
                  name="familyMedicalHistory"
                  value={formData.familyMedicalHistory}
                  onChange={handleChange}
                  placeholder="Tiền sử bệnh lý trong gia đình (nếu có)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Đặt lịch khám
        </Button>
      </Modal.Footer>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Modal>
  );
};

export default BookingForm;
