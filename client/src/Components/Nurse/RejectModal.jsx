import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RejectModal = ({ show, handleClose, handleConfirm, rejectReason, setRejectReason }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Lý do từ chối</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="rejectReason">
                        <Form.Label>Nhập lý do từ chối</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Hủy
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                    Xác nhận từ chối
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RejectModal;
