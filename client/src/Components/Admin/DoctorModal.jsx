import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DoctorModal = ({
  show,
  handleClose,
  handleSubmit,
  formData,
  handleChange,
  editingDoctor,
  specialties,
  role, // Thêm prop role
}) => {
  // Hàm xác định tiêu đề dựa trên role và trạng thái chỉnh sửa
  const getModalTitle = () => {
    const roleText = 
      role === "Nurse" ? "Y tá" :
      role === "HeadOfDepartment" ? "Trưởng khoa" :
      "Bác sĩ"; // Mặc định là bác sĩ
    return editingDoctor ? `Cập nhật thông tin ${roleText}` : `Thêm ${roleText}`;
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold w-100">
          {getModalTitle()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label className="d-block text-start fw-bold">Họ tên</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Họ tên"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="d-block text-start fw-bold">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="d-block text-start fw-bold">Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required={!editingDoctor}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="specialization">
            <Form.Label className="d-block text-start fw-bold">Chuyên khoa</Form.Label>
            <Form.Select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="">Chọn chuyên khoa</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="gender">
            <Form.Label className="d-block text-start fw-bold">Giới tính</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="experience">
            <Form.Label className="d-block text-start fw-bold">Kinh nghiệm</Form.Label>
            <Form.Control
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              onKeyDown={(e) => {
                if (["e", "E", ".", "-", "+"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingDoctor ? "Cập nhật" : "Tạo"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DoctorModal;
