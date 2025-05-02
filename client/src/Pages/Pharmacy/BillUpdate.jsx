import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const BillUpdate = () => {
    const { billId } = useParams();
    const [bill, setBill] = useState({});
    const [appointment, setAppointment] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [prices, setPrices] = useState({});
    const [services, setServices] = useState([]);
    const [diagnosisDetails, setDiagnosisDetails] = useState([]);
    const [showConfirmUpdate, setShowConfirmUpdate] = useState(false); // State for confirmation modal
    const navigate = useNavigate();

    useEffect(() => {
        fetchBillDetails();
    }, []);

    const fetchBillDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/pharmacy/detail/${billId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setBill(response.data.bill);
            setAppointment(response.data.bill.appointmentId);
            setDiagnosisDetails(response.data.diagnosisDetails);
            setPrescriptions(response.data.bill.medicineFees);
            setServices(response.data.bill.testFees || []);
            if (response.data.bill.medicineFees && response.data.bill.medicineFees.length > 0) {
                const oldPrices = response.data.bill.medicineFees.map((med) => med.unitPrice);
                setPrices(oldPrices);
            }
        } catch (error) {
            console.error("Error fetching bill details:", error);
            toast.error(error.response?.data?.message || "Không thể tải thông tin hóa đơn!");
        }
    };

    const handlePriceChange = (index, value) => {
        const updatedPrices = { ...prices, [index]: value };
        setPrices(updatedPrices);
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
        return services.reduce((total, service) => total + (service.price || 0), 0);
    }, [services]);

    // Tổng tiền cần trả
    const totalPayment = useMemo(() => {
        return totalMedicine + totalService;
    }, [totalMedicine, totalService]);

    const isPriceValid = () => {
        return prescriptions.every((_, index) => {
            const price = parseInt(prices[index]);
            return price && price > 0; // phải có giá trị và > 0
        });
    };

    const handleUpdatePrices = async () => {
        try {
            const medicineFees = prescriptions.map((prescription, index) => {
                const price = parseInt(prices[index]) || 0;
                const quantity = parseInt(prescription.quantity) || 0;
                return {
                    name: prescription.name,
                    unit: prescription.unit,
                    quantity,
                    unitPrice: price,
                    totalPrice: price * quantity,
                    usage: prescription.usage,
                };
            });

            const response = await axios.put(
                `http://localhost:8080/pharmacy/update-medicines-price/${billId}`,
                { medicineFees },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            if (response.status === 200) {
                setBill(response.data.bill); // Update bill with new data
                setPrescriptions(response.data.bill.medicineFees); // Update prescriptions
                toast.success("Cập nhật giá thuốc thành công!");
            } else {
                toast.error(response.data?.message || "Cập nhật giá thuốc thất bại!");
            }
        } catch (error) {
            console.error("Error updating medicine prices:", error);
            toast.error(error.response?.data?.message || "Có lỗi khi cập nhật giá thuốc!");
        } finally {
            setShowConfirmUpdate(false); // Close modal
        }
    };

    const handleQRCode = async () => {
        try {
            const response = await fetch("http://localhost:8080/payment/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    _id: bill._id,
                    redirectUrl: "http://localhost:5173/pharmacy/bills",
                    requestType: "captureWallet"
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment");
            }

            const result = await response.json();
            console.log("Payment API response:", result);

            if (result.payUrl) {
                window.location.href = result.payUrl;
            } else {
                toast.success("Thanh toán thành công!");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Có lỗi xảy ra khi thanh toán!");
        }
    };

    const hasPriceChanged = useMemo(() => {
        return prescriptions.some((prescription, index) => {
            const currentPrice = parseInt(prices[index]) || 0;
            const originalPrice = prescription.unitPrice || 0;
            return currentPrice !== originalPrice;
        });
    }, [prescriptions, prices]);

    return (
        <div className="container">
            <h2 className="text-center mt-4">Chi tiết hóa đơn</h2>

            {/* Hiển thị thông tin khám bệnh */}
            <Row className="patient-info pt-5">
                <Col>
                    <p>
                        <strong>Họ và tên người bệnh:</strong> {bill.patientName}
                    </p>
                    <p>
                        <strong>Ngày khám:</strong> {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Triệu chứng:</strong> {appointment.symptoms}
                    </p>
                </Col>
                <Col>
                    <p>
                        <strong>Tuổi:</strong> {appointment.age}
                    </p>
                    <p>
                        <strong>Giới tính:</strong> {appointment.gender}
                    </p>
                    <p>
                        <strong>Địa chỉ</strong> {appointment.address}
                    </p>
                </Col>
            </Row>

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
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.length > 0 ? (
                        prescriptions.map((prescription, index) => {
                            const price = parseInt(prices[index]) || 0;
                            const quantity = parseInt(prescription.quantity) || 0;
                            const total = price * quantity;

                            return (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>{prescription.name}</td>
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
                                                if (parseInt(value) < 1) {
                                                    handlePriceChange(index, "");
                                                } else {
                                                    handlePriceChange(index, value);
                                                }
                                            }}
                                            readOnly={bill.paymentStatus === "Paid"}
                                        />
                                    </td>
                                    <td className="text-center">{total.toLocaleString()} VND</td>
                                    <td>{prescription.usage}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">Khách hàng không lấy thuốc</td>
                        </tr>
                    )}
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

            <div className="d-flex justify-content-end mt-4 gap-2">

                <Button
                    variant="success"
                    onClick={handleQRCode}
                    disabled={!isPriceValid() || bill.paymentStatus === "Paid"}
                >
                    Thanh toán QR Code (MoMo)
                </Button>
                {prescriptions.length > 0 && hasPriceChanged && (
                    <Button
                        variant="warning"
                        onClick={() => setShowConfirmUpdate(true)}
                        disabled={!isPriceValid() || bill.paymentStatus === "Paid"}
                    >
                        Cập nhật giá thuốc
                    </Button>
                )}
            </div>

            {/* Confirmation Modal for Updating Prices */}
            <Modal show={showConfirmUpdate} onHide={() => setShowConfirmUpdate(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận cập nhật giá thuốc</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn cập nhật giá thuốc cho hóa đơn này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmUpdate(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdatePrices}
                    >
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BillUpdate;