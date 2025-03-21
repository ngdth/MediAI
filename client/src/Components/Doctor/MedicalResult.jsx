import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MedicalResult = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWaitingAppointments();
    }, []);

    const fetchWaitingAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/appointment/waiting', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log("Appointments data:", response.data);
            setAppointments(response.data.data || []); // Đảm bảo dữ liệu là mảng
        } catch (error) {
            console.error('Error fetching waiting appointments:', error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="text-center mt-4 mb-4">Kết quả khám bệnh</h2>
            {appointments.length === 0 ? (
                <div className="text-center">
                    <p>Không có lịch hẹn nào đang chờ xử lý.</p>
                </div>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th>#</th>
                            <th>Bệnh nhân</th>
                            <th>Ngày khám</th>
                            <th>Giờ khám</th>
                            <th>Triệu chứng</th>
                            <th>Chẩn đoán bệnh</th>
                            <th>Mức độ nghiêm trọng</th>
                            <th>Phương án điều trị</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((item, index) => {
                            const appointment = item.appointment; // Truy cập vào appointment
                            const diagnosis = item.diagnosisDetails && item.diagnosisDetails.length > 0 ? item.diagnosisDetails[0] : null; // Lấy phần tử đầu tiên của diagnosisDetails

                            return (
                                <tr key={appointment._id}>
                                    <td>{index + 1}</td>
                                    <td>{appointment.patientName || "Không có thông tin"}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                    <td>{appointment.time || "Không có thông tin"}</td>
                                    <td>{appointment.symptoms || "Không có thông tin"}</td>
                                    <td>{diagnosis?.diseaseName || "Chưa có chẩn đoán"}</td>
                                    <td>{diagnosis?.severity || "Chưa có thông tin"}</td>
                                    <td>{diagnosis?.treatmentPlan || "Chưa có phương án"}</td>
                                    <td>
                                        <Link
                                            to={`/doctor/manage-prescription/${appointment._id}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Tạo đơn thuốc
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MedicalResult;