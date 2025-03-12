import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagePrescription = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchWaitingAppointments();
    }, []);
    
    const fetchWaitingAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/appointment/waiting', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error('Error fetching waiting appointments:', error);
        }
    };
    
    const handleAssignToPharmacy = async (id) => {
        try {
            await axios.put(`http://localhost:8080/appointment/${id}/assign-to-pharmacy`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/doctor/manage-prescription');
        } catch (error) {
            console.error('Error assigning to pharmacy:', error);
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
                                <button className="btn btn-success" onClick={() => handleAssignToPharmacy(appointment._id)}>Assign to Pharmacy</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4">Không có lịch hẹn nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManagePrescription;
