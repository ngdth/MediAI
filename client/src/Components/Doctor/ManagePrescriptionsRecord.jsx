import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ManagePrescriptionsRecord = () => {
    const { appointmentId } = useParams();
    const [appointmentData, setAppointmentData] = useState({ appointment: {}, diagnosisDetails: [] });
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [prescriptions, setPrescriptions] = useState([
        { medicineName: '', unit: '', quantity: '', usage: '' }
    ]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchAppointmentDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment/waiting`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const appointments = response.data.data || [];
            const selectedAppointment = appointments.find(
                (item) => item.appointment._id === appointmentId
            );
            if (selectedAppointment) {
                console.log("Selected appointment:", selectedAppointment);
                setAppointmentData({
                    appointment: selectedAppointment.appointment || {},
                    diagnosisDetails: selectedAppointment.diagnosisDetails || []
                });
            } else {
                console.error("Appointment not found with ID:", appointmentId);
                setAppointmentData({ appointment: {}, diagnosisDetails: [] });
            }
        } catch (error) {
            console.error("Error fetching appointment details:", error);
            setAppointmentData({ appointment: {}, diagnosisDetails: [] });
        }
    };

    const fetchAllServices = async () => {
        try {
            const response = await axios.get("http://localhost:8080/service/active", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(response.data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
            setServices([]);
        }
    };

    useEffect(() => {
        fetchAppointmentDetails();
        fetchAllServices();
    }, [appointmentId]);

    const addPrescriptionRow = () => {
        setPrescriptions([
            ...prescriptions,
            { medicineName: '', unit: '', quantity: '', usage: '' }
        ]);
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updatedPrescriptions = [...prescriptions];
        updatedPrescriptions[index][field] = value;
        setPrescriptions(updatedPrescriptions);
    };

    const addServiceRow = () => {
        setSelectedServices([...selectedServices, { serviceId: "", name: "", department: "", price: 0 }]);
    };

    const handleServiceChange = (index, serviceId) => {
        const selectedService = services.find((service) => service._id === serviceId) || {};
        const updatedSelectedServices = [...selectedServices];
        updatedSelectedServices[index] = {
            serviceId: selectedService._id || "",
            name: selectedService.name || "",
            department: selectedService.department || "",
            price: selectedService.price || 0,
        };
        setSelectedServices(updatedSelectedServices);
    };

    const removeServiceRow = (index) => {
        setSelectedServices(selectedServices.filter((_, i) => i !== index));
    };

    const handleSubmitPrescription = async () => {
        try {
            const prescriptionData = prescriptions.map(prescription => ({
                medicineName: prescription.medicineName,
                unit: prescription.unit,
                quantity: prescription.quantity,
                usage: prescription.usage
            }));
            
            const serviceUsed = selectedServices.map(service => ({
                name: service.name,
                department: service.department,
                price: service.price
            }));

            await axios.post(
                `http://localhost:8080/appointment/${appointmentId}/createprescription`,
                { prescription: prescriptionData, service: serviceUsed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đơn thuốc đã được tạo!');
            navigate('/doctor/manage-prescription-result');
        } catch (error) {
            console.error("Error creating prescription:", error);
            alert('Có lỗi xảy ra khi tạo đơn thuốc.');
        }
    };

    const formatDate = (date) => {
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? "Không có thông tin" : parsedDate.toLocaleDateString("vi-VN");
    };

    const getDiagnosisDetail = (field) => {
        const diagnosis = Array.isArray(appointmentData.diagnosisDetails) && appointmentData.diagnosisDetails.length > 0
            ? appointmentData.diagnosisDetails[0]
            : {};
        return diagnosis[field] || "Không có thông tin";
    };

    return (
        <div className="container">
            <h2 className="text-center mt-4">Tạo đơn thuốc</h2>

            <div className="patient-info">
                <p><strong>Họ và tên:</strong> {appointmentData.appointment.patientName || "Không có thông tin"}</p>
                <p><strong>Ngày khám:</strong> {formatDate(appointmentData.appointment.date)}</p>
                <p><strong>Triệu chứng:</strong> {appointmentData.appointment.symptoms || "Không có thông tin"}</p>
                <p><strong>Chẩn đoán bệnh:</strong> {getDiagnosisDetail('diseaseName')}</p>
                <p><strong>Mức độ nghiêm trọng:</strong> {getDiagnosisDetail('severity')}</p>
                <p><strong>Phương án điều trị:</strong> {getDiagnosisDetail('treatmentPlan')}</p>
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
            <button className="btn btn-success mb-4" onClick={addPrescriptionRow}>+ Thêm thuốc</button>

            {/* Dịch vụ */}
            <h3 className="mt-5">Thông tin dịch vụ khám</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-center">Tên dịch vụ</th>
                        <th className="text-center">Khoa</th>
                        <th className="text-center">Giá tiền</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedServices.map((service, index) => (
                        <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                                <select
                                    className="form-control"
                                    value={service.serviceId}
                                    onChange={(e) => handleServiceChange(index, e.target.value)}
                                >
                                    <option value="">Chọn dịch vụ</option>
                                    {services.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="text-center">{service.department || "Không có thông tin"}</td>
                            <td className="text-center">{service.price.toLocaleString() || 0} VND</td>
                            <td className="text-center">
                                <button className="btn btn-danger" onClick={() => removeServiceRow(index)}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-success" onClick={addServiceRow}>
                + Thêm dịch vụ
            </button>

            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary" onClick={handleSubmitPrescription}>
                    Tạo đơn thuốc
                </button>
            </div>
        </div>
    );
};

export default ManagePrescriptionsRecord;