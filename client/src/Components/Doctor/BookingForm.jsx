import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import AvailabilityScheduler from "./AvailabilityScheduler";
import axios from "axios";

const BookingForm = ({ show, doctorId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    address: "",
    email: "",
    phone: "",
    reason: "",
    medicalHistory: "",
    familyMedicalHistory: "",
    doctorId,
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!selectedDay || !selectedSlot) {
      alert("Vui lòng chọn ngày và giờ khám!");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để đặt lịch.");
      return;
    }
  
    const appointmentData = {
      patientName: formData.fullName,
      date: selectedDay,
      time: selectedSlot,
      symptoms: formData.reason,
      doctorId: formData.doctorId
    };
  
    try {
      const response = await axios.post(
        "http://localhost:8080/appointment/book",
        appointmentData, // Dữ liệu gửi đi
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Đặt lịch thành công:", response.data);
      alert("Đặt lịch thành công!");
      onClose(); // Đóng modal sau khi đặt lịch thành công
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error.response?.data || error.message);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };  

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="large-modal">
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
              {/* Ngày khám */}
              <AvailabilityScheduler
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
                  name="reason"
                  value={formData.reason}
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
        <Button
          variant="primary"
          // onClick={() => onSubmit({ ...formData, selectedDay, selectedSlot })}
          onClick={handleSubmit}
        >
          Đặt lịch khám
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingForm;
