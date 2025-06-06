import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const AssignModal = ({ show, handleClose, onAssign, appointmentId }) => {
    const [pharmacy, setPharmacy] = useState([]);
    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        if (!show) return;

        const fetchPharmacy = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/admin/pharmacy`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                setPharmacy(response.data);
            } catch (error) {
                console.error("Error fetching pharmacy list:", error);
                toast.error("Có lỗi xảy ra khi lấy danh sách nhà thuốc.");
            }
        };

        fetchPharmacy();
    }, [show]);

    const handleAssign = async () => {
        if (!selectedId) {
            toast.error("Vui lòng chọn một nhà thuốc để gán!");
            return;
        }

        try {
            await axios.put(`${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}/assign-pharmacy`, 
                { pharmacyId: selectedId }, 
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            toast.success("Gán nhà thuốc thành công!");
            handleClose();
            if (onAssign) {
                await onAssign();
            }
        } catch (error) {
            console.error("Error assigning pharmacy:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gán nhà thuốc!");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chọn nhà thuốc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Chọn nhà thuốc</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {pharmacy.map((pharmacy) => (
                                <option key={pharmacy._id} value={pharmacy._id}>
                                    {pharmacy.username} ({pharmacy.email})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleAssign}>
                    Xác nhận
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AssignModal;
