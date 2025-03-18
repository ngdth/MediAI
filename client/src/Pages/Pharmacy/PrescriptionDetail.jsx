import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const PrescriptionsDetail = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState({});
    const [prescriptions, setPrescriptions] = useState([
        { medicineName: '', unit: '', quantity: '', usage: '' } // default empty prescription row
    ]);
    const navigate = useNavigate();

    // Fetch appointment details for prescription
    const fetchAppointmentDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointment(response.data.data);
        } catch (error) {
            console.error("Error fetching appointment details:", error);
        }
    };

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    // Handle adding a new row for prescription
    const addPrescriptionRow = () => {
        setPrescriptions([
            ...prescriptions,
            { medicineName: '', unit: '', quantity: '', usage: '' }
        ]);
    };

    // Handle input changes for prescriptions
    const handlePrescriptionChange = (index, field, value) => {
        const updatedPrescriptions = [...prescriptions];
        updatedPrescriptions[index][field] = value;
        setPrescriptions(updatedPrescriptions);
    };

    // Handle form submission
    const handleSubmitPrescription = async () => {
        try {
            const prescriptionData = prescriptions.map(prescription => ({
                medicineName: prescription.medicineName,
                unit: prescription.unit,
                quantity: prescription.quantity,
                usage: prescription.usage
            }));

            await axios.post(
                `http://localhost:8080/appointment/${appointmentId}/createprescription`,
                { prescription: prescriptionData },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Đơn thuốc đã được tạo!');
            navigate('/doctor/manage-prescription');
        } catch (error) {
            console.error("Error creating prescription:", error);
        }
    };

    return (
        <div className="container">
            <h2 className="text-center mt-4">Chi tiết đơn thuốc</h2>

            {/* Hiển thị thông tin khám bệnh */}
            <div className="patient-info">
                <p><strong>Họ và tên:</strong> {appointment.patientName}</p>
                <p><strong>Ngày khám:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Triệu chứng:</strong> {appointment.symptoms}</p>
                <p><strong>Chẩn đoán bệnh:</strong> {appointment.diagnosisDetails?.diseaseName}</p>
                <p><strong>Mức độ nghiêm trọng:</strong> {appointment.diagnosisDetails?.severity}</p>
                <p><strong>Phương án điều trị:</strong> {appointment.diagnosisDetails?.treatmentPlan}</p>
            </div>

            {/* Đơn thuốc */}
            <h3 className="mt-4">Thông tin đơn thuốc</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên thuốc</th>
                        <th>Đơn vị tính</th>
                        <th>Số lượng</th>
                        <th>Cách dùng</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((prescription, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                <input
                                    type="text"
                                    value={prescription.medicineName}
                                    onChange={(e) => handlePrescriptionChange(index, 'medicineName', e.target.value)}
                                    placeholder="Tên thuốc"
                                    className="form-control"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={prescription.unit}
                                    onChange={(e) => handlePrescriptionChange(index, 'unit', e.target.value)}
                                    placeholder="Đơn vị tính"
                                    className="form-control"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={prescription.quantity}
                                    onChange={(e) => handlePrescriptionChange(index, 'quantity', e.target.value)}
                                    placeholder="Số lượng"
                                    className="form-control"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={prescription.usage}
                                    onChange={(e) => handlePrescriptionChange(index, 'usage', e.target.value)}
                                    placeholder="Cách dùng"
                                    className="form-control"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="btn btn-success" onClick={addPrescriptionRow}>+ Thêm thuốc</button>

            {/* Submit Button */}
            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary" onClick={handleSubmitPrescription}>
                    Tạo hóa đơn
                </button>
            </div>
        </div>
    );
};

export default PrescriptionsDetail;
