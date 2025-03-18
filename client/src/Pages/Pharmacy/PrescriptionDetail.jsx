import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const PrescriptionsDetail = () => {
    const {appointmentId } = useParams();
    const [appointment, setAppointment] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [prices, setPrices] = useState({});
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointmentDetails();
        fetchAllServices();
    }, []);

    // Fetch appointment details for prescription
    const fetchAppointmentDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointment(response.data.data);
            setPrescriptions(response.data.data.prescription); // Set prescription
        } catch (error) {
            console.error("Error fetching appointment details:", error);
        }
    };

    const fetchAllServices = async () => {
        try {
            const response = await axios.get("http://localhost:8080/service/active", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const handlePriceChange = (index, value) => {
        const updatedPrices = { ...prices, [index]: value };
        setPrices(updatedPrices);
    };

    //Hàm thêm dịch vụ
    const addServiceRow = () => {
        setSelectedServices([...selectedServices, { serviceId: "", name: "", department: "", price: 0 }]);
    };

    const handleServiceChange = (index, serviceId) => {
        const selectedService = services.find((service) => service._id === serviceId);
        const updatedSelectedServices = [...selectedServices];
        updatedSelectedServices[index] = {
            serviceId: selectedService._id,
            name: selectedService.name,
            department: selectedService.department,
            price: selectedService.price,
        };
        setSelectedServices(updatedSelectedServices);
    };

    // Tính tổng tiền thuốc
    const totalMedicine = useMemo(() => {
        return prescriptions.reduce((total, prescription, index) => {
            const price = parseInt(prices[index]) || 0;
            const quantity = parseInt(prescription.quantity) || 0;
            return total + price * quantity;
        }, 0);
    }, [prescriptions, prices]);

    // Tính tổng tiền dịch vụ
    const totalService = useMemo(() => {
        return selectedServices.reduce((total, service) => {
            return total + (parseInt(service.price) || 0);
        }, 0);
    }, [selectedServices]);

    // Tính thuế 10%
    const tax = useMemo(() => {
        return (totalMedicine + totalService) * 0.1;
    }, [totalMedicine, totalService]);

    // Tổng tiền cần trả
    const totalPayment = useMemo(() => {
        return totalMedicine + totalService + tax;
    }, [totalMedicine, totalService, tax]);

    // Xử lý xóa dịch vụ
    const removeServiceRow = (index) => {
        const updatedServices = selectedServices.filter((_, i) => i !== index);
        setSelectedServices(updatedServices);
    };

    const handleCreateBill = async () => {
        try {
            const testFees = selectedServices.map(service => ({
                name: service.name,
                price: service.price
            }));
    
            const medicineFees = prescriptions.map((prescription, index) => {
                const price = parseInt(prices[index]) || 0;
                const quantity = parseInt(prescription.quantity) || 0;
                return {
                    name: prescription.medicineName,
                    quantity,
                    unitPrice: price,
                    totalPrice: price * quantity
                };
            });
    
            const additionalFees = tax;
            const paymentMethod = "MOMO";
    
            const response = await axios.post(
                `http://localhost:8080/pharmacy/createBill`,
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
                setTimeout(() => navigate("/pharmacy/pending"), 10000);
                // navigate("/pharmacy/pending");
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
                <p>
                    <strong>Chẩn đoán bệnh:</strong> {appointment.diagnosisDetails?.diseaseName}
                </p>
                <p>
                    <strong>Mức độ nghiêm trọng:</strong> {appointment.diagnosisDetails?.severity}
                </p>
                <p>
                    <strong>Phương án điều trị:</strong> {appointment.diagnosisDetails?.treatmentPlan}
                </p>
            </div>

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
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((prescription, index) => {
                        const price = parseInt(prices[index]) || 0;
                        const quantity = parseInt(prescription.quantity) || 0;
                        const total = price * quantity;

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
                                    />
                                </td>
                                <td className="text-center">{total} VND</td>
                                <td>{prescription.usage}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <h3 className="mt-4">Thông tin dịch vụ khám</h3>
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
                            <td className="text-center">{service.department}</td>
                            <td className="text-center">{service.price.toLocaleString()} VND</td>
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

            {/* Tổng tiền */}
            <div className="d-flex flex-column align-items-end mt-4">
                <div>
                    <strong>Tổng tiền thuốc:</strong> {totalMedicine.toLocaleString()} VND
                </div>
                <div>
                    <strong>Tổng tiền dịch vụ:</strong> {totalService.toLocaleString()} VND
                </div>
                <div>
                    <strong>Thuế (10%):</strong> {tax.toLocaleString()} VND
                </div>
                <div className="h4 mt-4">
                    <strong>TỔNG:</strong> {totalPayment.toLocaleString()} VND
                </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>
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
            <ToastContainer position="top-right" autoClose={6000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default PrescriptionsDetail;
