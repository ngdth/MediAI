import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BookingForm = ({ show, slot, formData, setFormData, onClose, onSubmit }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Book Appointment</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <p><strong>Selected Time:</strong> {slot?.replace("-", ":")}</p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone:</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason:</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit}>Book Appointment</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingForm;
