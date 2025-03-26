import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ManagePrescriptionsRecord = () => {
    const { appointmentId } = useParams();
    const [appointmentData, setAppointmentData] = useState({ appointment: {}, diagnosisDetails: [] });
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [usedServices, setUsedServices] = useState([]);
    const [prescriptions, setPrescriptions] = useState([
        { medicineName: '', unit: '', quantity: '', usage: '' }
    ]);
    const [doctorId, setDoctorId] = useState(null);
    const [expandedDoctors, setExpandedDoctors] = useState({});
    const [allPrescriptions, setAllPrescriptions] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                const response = await axios.get("http://localhost:8080/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const id = response.data.id;
                setDoctorId(id);
                console.log("Current Doctor ID:", id);
            } catch (error) {
                console.error("Error fetching doctor ID:", error);
            }
        };

        fetchDoctorId();
    }, [token]);

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
                setAllPrescriptions(selectedAppointment.prescriptions || []);
                setUsedServices(selectedAppointment.appointment.services || []);
            } else {
                console.error("Appointment not found with ID:", appointmentId);
                setAppointmentData({ appointment: {}, diagnosisDetails: [] });
                setAllPrescriptions([]);
            }
        } catch (error) {
            console.error("Error fetching appointment details:", error);
            setAppointmentData({ appointment: {}, diagnosisDetails: [] });
            setAllPrescriptions([]);
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
        setSelectedServices([...selectedServices, ""]);
    };

    const handleServiceChange = (index, serviceId) => {
        const updatedSelectedServices = [...selectedServices];
        updatedSelectedServices[index] = serviceId;
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

            await axios.post(
                `http://localhost:8080/appointment/${appointmentId}/createprescription`,
                { prescription: prescriptionData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedServices = usedServices.concat(selectedServices);

            await axios.put(
                `http://localhost:8080/appointment/${appointmentId}/update-field`,
                {
                    field: "services",
                    value: updatedServices,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Đơn thuốc và dịch vụ đã được lưu!');
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
            ? appointmentData.diagnosisDetails[appointmentData.diagnosisDetails.length - 1]
            : {};
        return diagnosis[field] || "Không có thông tin";
    };

    const toggleDoctorExpansion = (doctorId) => {
        setExpandedDoctors((prev) => ({
            ...prev,
            [doctorId]: !prev[doctorId],
        }));
    };

    const renderReadOnlyField = (label, value) => {
        let displayValue = value;
        if (label === "Lịch tái khám") {
            displayValue = value ? new Date(value).toISOString().split("T")[0] : "Không có thông tin";
        } else {
            displayValue = value || "Không có thông tin";
        }
        return (
            <tr>
                <td>{label}</td>
                <td>{displayValue}</td>
            </tr>
        );
    };

    const currentDoctorIndex = appointmentData.appointment.doctorId?.findIndex((doctor) => doctor._id === doctorId) || -1;
    const previousDoctors = currentDoctorIndex > 0 ? appointmentData.appointment.doctorId.slice(0, currentDoctorIndex) : [];

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

            {/* Các bác sĩ đã phụ trách */}
            <div className="mb-4">
                <h3 className="text-primary">Các bác sĩ đã phụ trách</h3>
                {previousDoctors.length > 0 ? (
                    previousDoctors.map((doctor) => (
                        <div key={doctor._id} className="mb-3">
                            <h4
                                onClick={() => toggleDoctorExpansion(doctor._id)}
                                style={{ cursor: "pointer", color: "#007bff" }}
                            >
                                Bác sĩ: {doctor.username} {expandedDoctors[doctor._id] ? "↓" : "→"}
                            </h4>
                            {expandedDoctors[doctor._id] && (
                                <div className="ml-3">
                                    <h5>Chi tiết chẩn đoán</h5>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Chỉ số</th>
                                                <th>Giá trị</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointmentData.diagnosisDetails
                                                .filter((dd) => dd.doctorId?._id === doctor._id)
                                                .map((dd, index) => (
                                                    <React.Fragment key={index}>
                                                        {renderReadOnlyField("Tên bệnh", dd.diseaseName)}
                                                        {renderReadOnlyField("Mức độ nghiêm trọng", dd.severity)}
                                                        {renderReadOnlyField("Kế hoạch điều trị", dd.treatmentPlan)}
                                                        {renderReadOnlyField("Lịch tái khám", dd.followUpSchedule)}
                                                        {renderReadOnlyField("Hướng dẫn đặc biệt", dd.specialInstructions)}
                                                    </React.Fragment>
                                                ))}
                                        </tbody>
                                    </table>

                                    <h5>Đơn thuốc</h5>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Tên thuốc</th>
                                                <th>Đơn vị</th>
                                                <th>Số lượng</th>
                                                <th>Cách dùng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allPrescriptions
                                                .filter((p) => p.doctorId?._id === doctor._id)
                                                .map((presc, index) => (
                                                    <tr key={index}>
                                                        <td>{presc.medicineName}</td>
                                                        <td>{presc.unit}</td>
                                                        <td>{presc.quantity}</td>
                                                        <td>{presc.usage}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Không có bác sĩ trước đó phụ trách.</p>
                )}
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
                    {selectedServices.map((serviceId, index) => {
                        const selectedService = services.find((s) => s._id === serviceId) || {};
                        return (
                            <tr key={index}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                    <select
                                        className="form-control"
                                        value={serviceId}
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
                                <td className="text-center">{selectedService.department || "Không có thông tin"}</td>
                                <td className="text-center">{selectedService.price ? selectedService.price.toLocaleString() : 0} VND</td>
                                <td className="text-center">
                                    <button className="btn btn-danger" onClick={() => removeServiceRow(index)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
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