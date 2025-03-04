import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const NurseManagement = () => {
    const [nurses, setNurses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        specialization: "",
        experience: 0,
    });
    const [editingNurse, setEditingNurse] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchNurses();
    }, []);

    const fetchNurses = async () => {
        try {
            const response = await axios.get("http://localhost:8080/admin/nurses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNurses(response.data);
        } catch (error) {
            console.error("Error fetching nurses:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNurse) {
                await axios.put(`http://localhost:8080/admin/nurses/update/${editingNurse._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/admin/nurses/create", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchNurses();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving nurse:", error);
        }
    };

    const handleEdit = (nurse) => {
        setFormData({
            username: nurse.username,
            email: nurse.email,
            password: "",
            specialization: nurse.specialization,
            experience: nurse.experience,
        });
        setEditingNurse(nurse);
        setShowModal(true);
    };

    const handleDelete = async (nurseId) => {
        try {
            await axios.delete(`http://localhost:8080/admin/nurses/delete/${nurseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchNurses();
        } catch (error) {
            console.error("Error deleting nurse:", error);
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", specialization: "", experience: 0 });
        setEditingNurse(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", paddingTop: "100px" }}>
            <h2 className="text-center mb-4">Nurse Management</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Add Nurse
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>Experience</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nurses.map((nurse) => (
                            <tr key={nurse._id}>
                                <td>{nurse.username}</td>
                                <td>{nurse.email}</td>
                                <td>{nurse.specialization}</td>
                                <td>{nurse.experience} years</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(nurse)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(nurse._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm/sửa bác sĩ */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingNurse ? "Edit Nurse" : "Add Nurse"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="form-control mb-2" />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control mb-2" />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required={!editingNurse} className="form-control mb-2" />
                        <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required className="form-control mb-2" />
                        <input type="number" name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} required className="form-control mb-2" />

                        <div className="text-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
                            <Button type="submit" variant="primary">{editingNurse ? "Update" : "Add"}</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default NurseManagement;
