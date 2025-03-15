import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AssignModal from './AssignModal';

const PrescriptionsRecordResult = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [assignType, setAssignType] = useState(""); // 'doctor' hoặc 'pharmacy'
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();

    // Fetch prescription created appointments for the doctor
    useEffect(() => {
        const fetchPrescriptionCreatedAppointments = async () => {
            try {
                const response = await axios.get('http://localhost:8080/appointment/prescription-created', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setAppointments(response.data.data);  // Lưu danh sách các appointment vào state
            } catch (error) {
                console.error('Error fetching prescription created appointments:', error);
            }
        };

        fetchPrescriptionCreatedAppointments();
    }, []);

    // Handle assign action for pharmacy or doctor
    const handleAssign = async (id) => {
        try {
            // Gọi API remove doctor
            await axios.put(`http://localhost:8080/appointment/${id}/remove-doctor`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert(`Doctor removed from prescription.`);
        } catch (error) {
            console.error(`Error processing action:`, error);
        }
    };

    const openAssignModal = (appointmentId, type) => {
        setSelectedAppointmentId(appointmentId);
        setAssignType(type);
        setModalShow(true);
    };

    return (
        <div className="container">
            <h2 className="text-center mt-4">Quản lý đơn thuốc</h2>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Bệnh nhân</th>
                        <th>Ngày khám</th>
                        <th>Kết luận và hướng điều trị</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length > 0 ? appointments.map((appointment) => (
                        <tr key={appointment._id}>
                            <td>{appointment.patientName}</td>
                            <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                            <td>{appointment.diagnosisDetails.treatmentPlan}</td>
                            <td>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleAssign(appointment._id, "doctor")}
                                >
                                    Assign to Doctor
                                </button>
                                <button
                                    className="btn btn-primary ml-2"
                                    onClick={() => openAssignModal(appointment._id, "pharmacy")}
                                >
                                    Assign to Pharmacy
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4">Không có đơn thuốc nào được tạo.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <AssignModal
                show={modalShow}
                handleClose={() => setModalShow(false)}
                onAssign={handleAssign}
                type={assignType}
            />
        </div>
    );
};

export default PrescriptionsRecordResult;
