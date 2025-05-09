import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { validateQuantity, validateMedicineName, validateUnit, validateUsage } from '../../utils/validateUtils';

const ManagePrescriptionsRecord = () => {
    const { appointmentId } = useParams();
    const [appointmentData, setAppointmentData] = useState({ appointment: {}, diagnosisDetails: [] });
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([""]);
    const [serviceErrors, setServiceErrors] = useState([{ service: "" }]);
    const [usedServices, setUsedServices] = useState([]);
    const [prescriptions, setPrescriptions] = useState([
        { medicineName: '', unit: '', quantity: '', usage: '' }
    ]);
    const [errors, setErrors] = useState([{
        medicineName: '',
        unit: '',
        quantity: '',
        usage: ''
    }]);
    const [doctorId, setDoctorId] = useState(null);
    const [doctorRole, setDoctorRole] = useState(null);
    const [expandedDoctors, setExpandedDoctors] = useState({});
    const [allPrescriptions, setAllPrescriptions] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const id = response.data.id;
                setDoctorId(id);
                setDoctorRole(response.data.role);
                console.log("Current Doctor ID:", id);
            } catch (error) {
                console.error("Error fetching doctor ID:", error);
                toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lấy thông tin bác sĩ.");
            }
        };

        fetchDoctorId();
    }, [token]);

    const fetchAppointmentDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/appointment/waiting`, {
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
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lấy chi tiết lịch hẹn.");
        }
    };

    const fetchAllServices = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/service/active`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(response.data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
            setServices([]);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lấy danh sách dịch vụ.");
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
        setErrors([...errors, {
            medicineName: '',
            unit: '',
            quantity: '',
            usage: ''
        }]);
    };

    const removePrescriptionRow = (index) => {
        if (prescriptions.length === 1) {
            toast.warn("Phải có ít nhất một hàng đơn thuốc!");
            return;
        }
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
        setErrors(errors.filter((_, i) => i !== index));
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updatedPrescriptions = [...prescriptions];
        if (field === 'quantity') {
            // Allow only digits or empty string
            if (value === '' || /^\d*$/.test(value)) {
                updatedPrescriptions[index][field] = value;
            }
        } else {
            updatedPrescriptions[index][field] = value;
        }
        setPrescriptions(updatedPrescriptions);

        const updatedErrors = [...errors];
        if (field === 'medicineName') {
            const validation = validateMedicineName(value);
            updatedErrors[index].medicineName = validation.message;
        } else if (field === 'unit') {
            const validation = validateUnit(value);
            updatedErrors[index].unit = validation.message;
        } else if (field === 'quantity') {
            const validation = validateQuantity(value);
            updatedErrors[index].quantity = validation.message;
        } else if (field === 'usage') {
            const validation = validateUsage(value);
            updatedErrors[index].usage = validation.message;
        }
        setErrors(updatedErrors);
    };

    const handleQuantityInput = (e) => {
        const value = e.target.value;
        // Allow only digits
        if (!/^\d*$/.test(value)) {
            e.target.value = value.replace(/\D/g, '');
        }
    };

    const handleQuantityPaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        // Allow only digits
        if (!/^\d*$/.test(pastedData)) {
            e.preventDefault();
        }
    };

    const addServiceRow = () => {
        setSelectedServices([...selectedServices, ""]);
        setServiceErrors([...serviceErrors, { service: "" }]);
    };

    const handleServiceChange = (index, option) => {
        const serviceId = option ? option.value : "";
        const updatedSelectedServices = [...selectedServices];
        updatedSelectedServices[index] = serviceId;
        setSelectedServices(updatedSelectedServices);

        const updatedServiceErrors = [...serviceErrors];
        updatedServiceErrors[index] = {
            service: serviceId === "" ? "Vui lòng chọn dịch vụ bệnh nhân đã sử dụng!" : ""
        };
        setServiceErrors(updatedServiceErrors);
    };

    const removeServiceRow = (index) => {
        setSelectedServices(selectedServices.filter((_, i) => i !== index));
        setServiceErrors(serviceErrors.filter((_, i) => i !== index));
    };

    const handleSubmitPrescription = async () => {
        // Validate prescriptions
        const validationErrors = prescriptions.map((prescription, index) => {
            const medicineNameValidation = validateMedicineName(prescription.medicineName);
            const unitValidation = validateUnit(prescription.unit);
            const quantityValidation = validateQuantity(prescription.quantity);
            const usageValidation = validateUsage(prescription.usage);
            return {
                medicineName: medicineNameValidation.message,
                unit: unitValidation.message,
                quantity: quantityValidation.message,
                usage: usageValidation.message
            };
        });

        setErrors(validationErrors);

        // Validate services
        const validationServiceErrors = selectedServices.map((serviceId, index) => ({
            service: serviceId === "" ? "Vui lòng chọn dịch vụ bệnh nhân đã sử dụng!" : ""
        }));

        setServiceErrors(validationServiceErrors);

        const hasPrescriptionErrors = validationErrors.some(error =>
            error.medicineName !== '' ||
            error.unit !== '' ||
            error.quantity !== '' ||
            error.usage !== ''
        );

        const hasServiceErrors = validationServiceErrors.some(error => error.service !== '');

        if (hasPrescriptionErrors || hasServiceErrors) {
            toast.error("Vui lòng sửa các lỗi trước khi gửi!");
            return;
        }

        try {
            const prescriptionData = prescriptions.map(prescription => ({
                medicineName: prescription.medicineName,
                unit: prescription.unit,
                quantity: parseInt(prescription.quantity, 10),
                usage: prescription.usage
            }));

            await axios.post(
                `${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}/createprescription`,
                { prescription: prescriptionData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedServices = usedServices.concat(selectedServices);

            await axios.put(
                `${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}/update-field`,
                {
                    field: "services",
                    value: updatedServices,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Đơn thuốc và dịch vụ đã được lưu!');
            if (doctorRole === "doctor") {
                navigate('/doctor/manage-prescription-result');
            } else if (doctorRole === "head of department") {
                navigate('/hod/manage-prescription-result');
            }
        } catch (error) {
            console.error("Error creating prescription:", error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuốc.');
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
        let displayValue;
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

    // Options for react-select
    const serviceOptions = [
        { value: "", label: "Chọn dịch vụ" },
        ...services.map(s => ({
            value: s._id,
            label: s.name
        }))
    ];

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
            <Form>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên thuốc</th>
                            <th>Đơn vị tính</th>
                            <th>Số lượng</th>
                            <th>Cách dùng</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.map((prescription, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <Form.Group controlId={`prescription-medicineName-${index}`}>
                                        <Form.Control
                                            type="text"
                                            value={prescription.medicineName}
                                            onChange={(e) => handlePrescriptionChange(index, 'medicineName', e.target.value)}
                                            placeholder="Tên thuốc"
                                            isInvalid={!!errors[index]?.medicineName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors[index]?.medicineName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group controlId={`prescription-unit-${index}`}>
                                        <Form.Control
                                            type="text"
                                            value={prescription.unit}
                                            onChange={(e) => handlePrescriptionChange(index, 'unit', e.target.value)}
                                            placeholder="Viên, Tuýp, Lọ,..."
                                            isInvalid={!!errors[index]?.unit}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors[index]?.unit}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group controlId={`prescription-quantity-${index}`}>
                                        <Form.Control
                                            type="text"
                                            value={prescription.quantity}
                                            onChange={(e) => handlePrescriptionChange(index, 'quantity', e.target.value)}
                                            onInput={handleQuantityInput}
                                            onPaste={handleQuantityPaste}
                                            onKeyDown={(e) => {
                                                if (["e", "E", ".", "-", "+"].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            placeholder="Số lượng"
                                            isInvalid={!!errors[index]?.quantity}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors[index]?.quantity}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group controlId={`prescription-usage-${index}`}>
                                        <Form.Control
                                            type="text"
                                            value={prescription.usage}
                                            onChange={(e) => handlePrescriptionChange(index, 'usage', e.target.value)}
                                            placeholder="Cách dùng"
                                            isInvalid={!!errors[index]?.usage}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors[index]?.usage}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </td>
                                <td className="text-center">
                                    <Button variant="danger" onClick={() => removePrescriptionRow(index)}>
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Form>
            <Button className="mb-4" variant="success" onClick={addPrescriptionRow}>
                + Thêm thuốc
            </Button>

            {/* Dịch vụ */}
            <h3 className="mt-5">Thông tin dịch vụ khám</h3>
            <Form>
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
                                        <Form.Group controlId={`service-${index}`}>
                                            <Select
                                                classNamePrefix="service-select"
                                                value={serviceOptions.find(option => option.value === serviceId) || null}
                                                onChange={(option) => handleServiceChange(index, option)}
                                                options={serviceOptions}
                                                placeholder="Chọn dịch vụ"
                                                isInvalid={!!serviceErrors[index]?.service}
                                            />
                                            {serviceErrors[index]?.service && (
                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                    {serviceErrors[index]?.service}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </td>
                                    <td className="text-center">{selectedService.department || "Không có thông tin"}</td>
                                    <td className="text-center">{selectedService.price ? selectedService.price.toLocaleString() : 0} VND</td>
                                    <td className="text-center">
                                        <Button variant="danger" onClick={() => removeServiceRow(index)}>
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Form>
            <Button variant="success" onClick={addServiceRow}>
                + Thêm dịch vụ
            </Button>

            <div className="d-flex justify-content-end mt-4">
                <Button variant="primary" onClick={handleSubmitPrescription}>
                    Tạo đơn thuốc
                </Button>
            </div>
        </div>
    );
};

export default ManagePrescriptionsRecord;