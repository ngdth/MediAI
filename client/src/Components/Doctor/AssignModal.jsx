import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const AssignModal = ({ show, handleClose, onAssign, type }) => {
    const [list, setList] = useState([]);
    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        if (!show) return;

        const fetchList = async () => {
            try {
                const endpoint = type === "doctor"
                    ? "http://localhost:8080/user/doctors"
                    : "http://localhost:8080/admin/pharmacy";

                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                setList(response.data);
            } catch (error) {
                console.error(`Error fetching ${type} list:`, error);
            }
        };

        fetchList();
    }, [show, type]);

    const handleAssign = () => {
        if (!selectedId) {
            alert("Vui lòng chọn một người để gán!");
            return;
        }
        onAssign(selectedId);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chọn {type === "doctor" ? "Bác sĩ" : "Nhà thuốc"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>{type === "doctor" ? "Chọn bác sĩ" : "Chọn nhà thuốc"}</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {list.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.username} ({item.email})
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
