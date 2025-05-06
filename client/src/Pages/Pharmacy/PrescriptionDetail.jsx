import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const PrescriptionsDetail = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [prices, setPrices] = useState({});
    const [services, setServices] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [diagnosisDetails, setDiagnosisDetails] = useState([]);
    const [excludedPrescriptions, setExcludedPrescriptions] = useState({})
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointmentDetails();
    }, []);

    // Fetch appointment details for prescription
    const fetchAppointmentDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/appointment/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointment(response.data.data.appointment);
            setDiagnosisDetails(response.data.data.diagnosisDetails);
            setPrescriptions(response.data.data.prescriptions); // Set prescription
            setServices(response.data.data.appointment.services || []); // Set services
        } catch (error) {
            console.error("Error fetching appointment details:", error);
        }
    };

    const handlePriceChange = (index, value) => {
        const updatedPrices = { ...prices, [index]: value };
        setPrices(updatedPrices);
    };

    const handleExcludePrescription = (index) => {
        setExcludedPrescriptions((prev) => ({
            ...prev,
            [index]: !prev[index], // Toggle exclusion status
        }));
    };

    // Tính tổng tiền thuốc
    const totalMedicine = useMemo(() => {
        return prescriptions.reduce((total, prescription, index) => {
            if (excludedPrescriptions[index]) return total;
            const price = parseInt(prices[index]) || 0;
            const quantity = parseInt(prescription.quantity) || 0;
            return total + price * quantity;
        }, 0);
    }, [prescriptions, prices]);

    // Tính tổng tiền dịch vụ
    const totalService = useMemo(() => {
        return services.reduce((total, service) => total + (service.price || 0), 0);
    }, [services]);


    // Tổng tiền cần trả
    const totalPayment = useMemo(() => {
        return totalMedicine + totalService;
    }, [totalMedicine, totalService]);

    const isPriceValid = () => {
        return prescriptions.every((_, index) => {
            if (excludedPrescriptions[index]) return true;
            const price = parseInt(prices[index]);
            return price && price > 0; // phải có giá trị và > 0
        });
    };

    const handleCreateBill = async () => {
        try {
            const medicineFees = prescriptions.map((prescription, index) => {
                if (excludedPrescriptions[index]) return null;
                const price = parseInt(prices[index]) || 0;
                const quantity = parseInt(prescription.quantity) || 0;
                return {
                    name: prescription.medicineName,
                    quantity,
                    unit: prescription.unit,
                    unitPrice: price,
                    totalPrice: price * quantity,
                    usage: prescription.usage,
                };
            })
            .filter((item) => item !== null);

            const testFees = services.map((service) => ({
                name: service.name,
                department: service.department,
                price: service.price,
            }));

            const additionalFees = 0;
            const paymentMethod = "MOMO";

            const response = await axios.post(
                `${import.meta.env.VITE_BE_URL}/pharmacy/createbill`,
                {
                    appointmentId: appointmentId,
                    testFees,
                    medicineFees,
                    additionalFees,
                    paymentMethod,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            console.log(response);
            if (response.status === 201) {
                toast.success("Tạo hóa đơn thành công!");
                navigate(`/pharmacy/bill/${response.data.billId}`); // Redirect to bill detail page
            } else {
                toast.error(response.data?.message || "Tạo hóa đơn thất bại!");
            }
        } catch (error) {
            console.error("Error creating bill:", error);
            console.log(error.response.data);
            console.log(error);
            toast.error("Có lỗi khi tạo hóa đơn!");
        }
    };

    return (
        <div className="container">
            <h2 className="text-center mt-4">Chi tiết đơn thuốc</h2>

            {/* Hiển thị thông tin khám bệnh */}
            <div className="patient-info">
                <p>
                    <strong>Họ và tên:</strong> {appointment.patientName}
                </p>
                <p>
                    <strong>Ngày khám:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p>
                    <strong>Triệu chứng:</strong> {appointment.symptoms}
                </p>
            </div>

            {/* Chẩn đoán của bác sĩ */}
            <h3 className="mt-4">Kết quả khám bệnh</h3>
            {Array.isArray(diagnosisDetails) && diagnosisDetails.length > 0 ? (
                diagnosisDetails.map((diagnosis, index) => (
                    <div key={index} className="mb-4">
                        {diagnosisDetails.length > 1 && <h5 className="mt-4">Kết quả khám bệnh {index + 1}</h5>}
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <th>Chẩn đoán bệnh</th>
                                    <td>{diagnosis.diseaseName || "Không có thông tin"}</td>
                                </tr>
                                <tr>
                                    <th>Mức độ nghiêm trọng</th>
                                    <td>{diagnosis.severity || "Không có thông tin"}</td>
                                </tr>
                                <tr>
                                    <th>Phương án điều trị</th>
                                    <td>{diagnosis.treatmentPlan || "Không có thông tin"}</td>
                                </tr>
                                <tr>
                                    <th>Bác sĩ đưa kết quả</th>
                                    <td>{diagnosis.doctorId?.username || "Không có thông tin"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>Không có thông tin chẩn đoán.</p>
            )}

            {/* Đơn thuốc */}
            <h3 className="mt-4">Thông tin đơn thuốc</h3>
            <table className="table table-bordered mb-4">
                <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-center">Tên thuốc</th>
                        <th className="text-center">Đơn vị tính</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-center">Giá</th>
                        <th className="text-center">Thành tiền</th>
                        <th className="text-center">Cách dùng</th>
                        <th className="text-center">Bệnh nhân không lấy thuốc</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((prescription, index) => {
                        const price = parseInt(prices[index]) || 0;
                        const quantity = parseInt(prescription.quantity) || 0;
                        const total = excludedPrescriptions[index] ? 0 : price * quantity; // Set total to 0 if excluded

                        return (
                            <tr key={index}>
                                <td className="text-center">{index + 1}</td>
                                <td>{prescription.medicineName}</td>
                                <td>{prescription.unit}</td>
                                <td className="text-center">{prescription.quantity}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Nhập giá"
                                        min="1000"
                                        value={prices[index] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Không cho nhập số âm
                                            if (parseInt(value) < 1) {
                                                handlePriceChange(index, ""); // Reset nếu nhập số âm
                                            } else {
                                                handlePriceChange(index, value);
                                            }
                                        }}
                                        disabled={excludedPrescriptions[index]} // Disable price input if excluded
                                    />
                                </td>
                                <td className="text-center">{total} VND</td>
                                <td>{prescription.usage}</td>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={excludedPrescriptions[index] || false}
                                        onChange={() => handleExcludePrescription(index)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {!isPriceValid() && (
                <p className="text-danger mt-2">Vui lòng nhập đầy đủ giá cho tất cả thuốc trước khi tạo hóa đơn.</p>
            )}
            <h3 className="mt-4">Thông tin dịch vụ khám</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-center">Tên dịch vụ</th>
                        <th className="text-center">Khoa</th>
                        <th className="text-center">Giá tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service, index) => (
                        <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{service.name}</td>
                            <td className="text-center">{service.department}</td>
                            <td className="text-center">{service.price.toLocaleString()} VND</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tổng tiền */}
            <div className="d-flex flex-column align-items-end mt-4">
                <div>
                    <strong>Tổng tiền thuốc:</strong> {totalMedicine.toLocaleString()} VND
                </div>
                <div>
                    <strong>Tổng tiền dịch vụ:</strong>
                    {totalService.toLocaleString()} VND
                </div>
                <div className="h4 mt-4">
                    <strong>TỔNG:</strong> {totalPayment.toLocaleString()} VND
                </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary" onClick={() => setShowConfirm(true)} disabled={!isPriceValid()}>
                    Tạo hóa đơn
                </button>
            </div>
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận tạo hóa đơn</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn tạo hóa đơn cho bệnh nhân này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleCreateBill();
                            setShowConfirm(false);
                        }}
                    >
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PrescriptionsDetail;
