import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssignModal from './AssignModal';

const PrescriptionsRecordResult = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptionCreatedAppointments = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://amma-care.com/appointment/prescription-created', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log("Appointments data:", response.data);
                setAppointments(response.data.data || []);
            } catch (error) {
                console.error('Error fetching prescription created appointments:', error);
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptionCreatedAppointments();
    }, []);

    const handleAssignToDoctor = async (id) => {
        try {
            await axios.put(
                `https://amma-care.com/appointment/${id}/status`,
                { status: "Pending" },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert(`Appointment status updated to Pending.`);

            const response = await axios.get('https://amma-care.com/appointment/prescription-created', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error(`Error updating appointment status:`, error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn.");
        }
    };

    const openAssignModal = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setModalShow(true);
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
            <h2 className="text-center mt-4 mb-4">Quản lý đơn thuốc</h2>
            {appointments.length === 0 ? (
                <div className="text-center">
                    <p>Không có đơn thuốc nào được tạo.</p>
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
                            <th>Kết luận và hướng điều trị</th>
                            <th>Đơn thuốc</th>
                            <th style={{ width: '160px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((item, index) => {
                            const appointment = item.appointment;
                            const diagnosis =
                                item.diagnosisDetails && item.diagnosisDetails.length > 0
                                    ? item.diagnosisDetails[item.diagnosisDetails.length - 1]
                                    : null;
                            const prescriptionList = item.prescriptions || [];

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
                                        {prescriptionList.length > 0 ? (
                                            <ul>
                                                {prescriptionList.map((prescription, idx) => (
                                                    <li key={idx}>
                                                        {prescription.medicineName} - {prescription.quantity} {prescription.unit} - {prescription.usage}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "Chưa có đơn thuốc"
                                        )}
                                    </td>
                                    <td className="text-nowrap">
                                        <div className="d-flex flex-column gap-2">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleAssignToDoctor(appointment._id)}
                                            >
                                                Gửi bác sĩ khác
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => openAssignModal(appointment._id)}
                                            >
                                                Gửi nhà thuốc
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <AssignModal
                show={modalShow}
                appointmentId={selectedAppointmentId}
                handleClose={() => setModalShow(false)}
            />
        </div>
    );
};

export default PrescriptionsRecordResult;
