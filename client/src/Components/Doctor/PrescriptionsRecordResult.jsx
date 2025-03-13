import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PrescriptionsRecordResult = () => {
    const [appointments, setAppointments] = useState([]);
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
    const handleAssign = async (id, type) => {
        try {
            const apiEndpoint = type === 'doctor'
                ? `http://localhost:8080/appointment/${id}/assign-to-doctor`
                : `http://localhost:8080/appointment/${id}/assign-to-pharmacy`;
            
            await axios.put(apiEndpoint, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert(`Prescription assigned to ${type}`);
            navigate('/doctor/manage-prescription'); // Navigate back to Manage Prescription page
        } catch (error) {
            console.error(`Error assigning prescription to ${type}:`, error);
        }
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
                                    onClick={() => handleAssign(appointment._id, 'doctor')}
                                >
                                    Assign to Doctor
                                </button>
                                <button
                                    className="btn btn-primary ml-2"
                                    onClick={() => handleAssign(appointment._id, 'pharmacy')}
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
        </div>
    );
};

export default PrescriptionsRecordResult;
