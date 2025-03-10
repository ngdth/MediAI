import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        specialization: "",
        experience: 0,
    });
    const [editingDoctor, setEditingDoctor] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/doctors", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await axios.put(`http://localhost:8080/admin/doctors/update/${editingDoctor._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/admin/doctors/create", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchDoctors();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving doctor:", error);
        }
    };

    const handleEdit = (doctor) => {
        setFormData({
            username: doctor.username,
            email: doctor.email,
            password: "",
            specialization: doctor.specialization,
            experience: doctor.experience,
        });
        setEditingDoctor(doctor);
        setShowModal(true);
    };

    const handleDelete = async (doctorId) => {
        try {
            await axios.delete(`http://localhost:8080/admin/doctors/delete/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDoctors();
        } catch (error) {
            console.error("Error deleting doctor:", error);
        }
    };

    const handleShowModal = () => {
        setFormData({ username: "", email: "", password: "", specialization: "", experience: 0 });
        setEditingDoctor(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", paddingTop: "100px" }}>
            <h2 className="text-center mb-4">Doctor Management</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={handleShowModal}>
                    Add Doctor
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
                        {doctors.map((doctor) => (
                            <tr key={doctor._id}>
                                <td>{doctor.username}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.experience} years</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(doctor)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doctor._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm/sửa bác sĩ */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="form-control mb-2" />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control mb-2" />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required={!editingDoctor} className="form-control mb-2" />
                        <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required className="form-control mb-2" />
                        <input type="number" name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} required className="form-control mb-2" />

                        <div className="text-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
                            <Button type="submit" variant="primary">{editingDoctor ? "Update" : "Add"}</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DoctorManagement;
