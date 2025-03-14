import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const MedicalResult = () => {
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

    return (
        <div className="container">
            <h2 className="text-center mt-4">Kết quả khám bệnh</h2>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Bệnh nhân</th>
                        <th>Ngày khám</th>
                        <th>Triệu chứng</th>
                        <th>Chẩn đoán bệnh</th>
                        <th>Mức độ nghiêm trọng</th>
                        <th>Phương án điều trị</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length > 0 ? appointments.map((appointment) => (
                        <tr key={appointment._id}>
                            <td>{appointment.patientName}</td>
                            <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                            <td>{appointment.symptoms}</td>
                            <td>{appointment.diagnosisDetails?.diseaseName}</td>
                            <td>{appointment.diagnosisDetails?.severity}</td>
                            <td>{appointment.diagnosisDetails?.treatmentPlan}</td>
                            <td>
                                <Link to={`/doctor/manage-prescription/${appointment._id}`} className="btn btn-primary">
                                    Tạo đơn thuốc
                                </Link>
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

export default MedicalResult;
