"use client"
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Section from "../../Components/Section"
import PageHeading from "../../Components/PageHeading"
import BillExportPDF from "../Pharmacy/BillExportPDF";

const PaymentDetail = () => {
    const { billId } = useParams();
    const [bill, setBill] = useState({});
    const [appointment, setAppointment] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [services, setServices] = useState([]);
    const [diagnosisDetails, setDiagnosisDetails] = useState([]);
    const headingData = {
        title: "Chi tiết hóa đơn",
    }

    console.log("Bill ID:", billId);

    useEffect(() => {
        fetchBillDetails();
    }, []);

    const fetchBillDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/pharmacy/detail/${billId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setBill(response.data.bill);
            setAppointment(response.data.bill.appointmentId);
            setDiagnosisDetails(response.data.diagnosisDetails);
            setPrescriptions(response.data.bill.medicineFees);
            setServices(response.data.bill.testFees || []);
            console.log(response.data.bill.appointmentId);
        } catch (error) {
            console.error("Error fetching bill details:", error);
            toast.error(error.response?.data?.message || "Không thể tải thông tin hóa đơn!");
        }
    };

    // Tính tổng tiền thuốc
    const totalMedicine = useMemo(() => {
        return prescriptions.reduce((total, prescription) => {
            const price = parseInt(prescription.unitPrice) || 0;
            const quantity = parseInt(prescription.quantity) || 0;
            return total + price * quantity;
        }, 0);
    }, [prescriptions]);

    // Tính tổng tiền dịch vụ
    const totalService = useMemo(() => {
        return services.reduce((total, service) => total + (service.price || 0), 0);
    }, [services]);

    // Tổng tiền cần trả
    const totalPayment = useMemo(() => {
        return totalMedicine + totalService;
    }, [totalMedicine, totalService]);

    const handleQRCode = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/payment/create-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: bill._id,
                    redirectUrl: `${import.meta.env.VITE_FE_URL}/pharmacy/bills`,
                    requestType: "captureWallet",
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

    return (
        <>
            <Section
                topSpaceMd="100"
            >
            </Section>

            <Section
                className="cs_page_heading cs_bg_filed cs_center"
                backgroundImage="/assets/img/banner-doctors.png"
            >
                <PageHeading data={headingData} />
            </Section>
            <div className="container">
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
                            <strong>Địa chỉ:</strong> {appointment.address}
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
                                const price = parseInt(prescription.unitPrice) || 0;
                                const quantity = parseInt(prescription.quantity) || 0;
                                const total = price * quantity;

                                return (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{prescription.name}</td>
                                        <td>{prescription.unit}</td>
                                        <td className="text-center">{prescription.quantity}</td>
                                        <td className="text-center">{price.toLocaleString()} VND</td>
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
                        <strong>Tổng tiền dịch vụ:</strong> {totalService.toLocaleString()} VND
                    </div>
                    <div className="h4 mt-4">
                        <strong>TỔNG:</strong> {totalPayment.toLocaleString()} VND
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 gap-2">
                    <Button
                        variant="success"
                        onClick={handleQRCode}
                        disabled={bill.paymentStatus === "Paid"}
                    >
                        Thanh toán QR Code (MoMo)
                    </Button>
                    <BillExportPDF
                        bill={bill}
                        appointment={appointment}
                        diagnosisDetails={diagnosisDetails}
                        prescriptions={prescriptions}
                        services={services}
                        totalMedicine={totalMedicine}
                        totalService={totalService}
                        totalPayment={totalPayment}
                    />
                </div>
            </div>
        </>
    );
};

export default PaymentDetail;