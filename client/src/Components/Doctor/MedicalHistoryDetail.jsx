import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const MedicalHistoryDetail = () => {
    const { appointmentId } = useParams(); // Nhận appointmentId từ URL
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState({});
    const [tests, setTests] = useState({});
    const [diagnosisDetails, setDiagnosisDetails] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const token = localStorage.getItem("token");

    // Fetch dữ liệu từ API khi component được mount
    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                console.log(`Fetching details for appointment ID: ${appointmentId}`);
                const response = await axios.get(`http://localhost:8080/appointment/history/${appointmentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data.data;
                console.log("Fetched appointment details:", data);

                setAppointment(data.appointment);
                setVitals(data.vitals[0] || {});
                setTests(data.tests[0] || {});
                setDiagnosisDetails(data.diagnosisDetails || []);
                setPrescriptions(data.prescriptions || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointment details:", error);
                setLoading(false);
            }
        };

        fetchAppointmentDetails();
    }, [appointmentId, token]);

    // Render các trường dữ liệu chỉ đọc
    const renderReadOnlyField = (label, value) => {
        let displayValue = value;
        if (label === "Giới tính") {
            displayValue = value === "male" ? "Nam" : value === "female" ? "Nữ" : value || "Chưa có dữ liệu";
        } else if (label === "Ngày") {
            displayValue = value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có dữ liệu";
        } else if (label === "Lịch tái khám") {
            displayValue = value ? new Date(value).toISOString().split("T")[0] : "Chưa có dữ liệu";
        } else {
            displayValue = value || "Chưa có dữ liệu";
        }

        return (
            <tr>
                <td>{label}</td>
                <td>{displayValue}</td>
            </tr>
        );
    };

    // Kiểm tra nếu dữ liệu đang được tải
    if (loading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    // Kiểm tra nếu không tìm thấy cuộc hẹn
    if (!appointment) {
        return (
            <div className="container">
                <p>Không tìm thấy lịch hẹn.</p>
            </div>
        );
    }

    const renderImages = (imagePaths) => {
        imagePaths = imagePaths || [];
        if (imagePaths.length === 0) {
            return <span>Không có hình ảnh</span>;
        }
        return imagePaths.map((path, index) => (
            <img key={index} src={path} style={{ width: "100px", height: "100px", margin: "5px" }} alt="Test Image" />
        ));
    };

    const testTypes = [
        { label: "Xét nghiệm máu", detailKey: "bloodTest", imageKey: null },
        { label: "Xét nghiệm nước tiểu", detailKey: "urineTest", imageKey: null },
        { label: "X-quang", detailKey: "xRay", imageKey: "xRayImg" },
        { label: "Siêu âm", detailKey: "ultrasound", imageKey: "ultrasoundImg" },
        { label: "MRI", detailKey: "mri", imageKey: "mriImg" },
        { label: "Điện tâm đồ", detailKey: "ecg", imageKey: "ecgImg" },
    ];

    // Log dữ liệu để kiểm tra
    // console.log("Appointment Data:", appointment);
    // console.log("Vitals Data:", vitals);
    console.log("Tests Data:", tests);
    // console.log("Diagnosis Details:", diagnosisDetails);
    // console.log("Prescriptions:", prescriptions);

    return (
        <div className="container">
            <h2 className="text-center ">Kết quả khám bệnh</h2>

            <div>
                <strong>Bệnh nhân:</strong> {appointment.patientName}
                <p>
                    <strong>Triệu chứng:</strong> {appointment.symptoms}
                </p>
            </div>

            {/* Thông tin khám bệnh - Chỉ đọc */}
            <div className="mb-4">
                <h3 className="text-primary">Thông tin khám bệnh</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Chỉ số</th>
                            <th>Giá trị</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderReadOnlyField("Mạch", vitals.pulse)}
                        {renderReadOnlyField("Huyết áp", vitals.bloodPressure)}
                        {renderReadOnlyField("Nhiệt độ cơ thể", vitals.temperature)}
                        {renderReadOnlyField("Cân nặng", vitals.weight)}
                        {renderReadOnlyField("Chiều cao", vitals.height)}
                        {renderReadOnlyField("Tình trạng chung", vitals.generalCondition)}
                    </tbody>
                </table>
            </div>

            {/* Xét nghiệm - Chỉ đọc */}
            <div className="mb-4">
                <h3 className="text-primary">Xét nghiệm</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Xét nghiệm</th>
                            <th>Chi tiết</th>
                            <th>Hình Ảnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testTypes.map((type) => {
                            const detail = tests[type.detailKey] || "Chưa có dữ liệu";
                            const imagePaths = type.imageKey ? tests[type.imageKey] : [];
                            return (
                                <tr key={type.label}>
                                    <td>{type.label}</td>
                                    <td>{detail}</td>
                                    <td>{renderImages(imagePaths)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Đơn thuốc */}
            <div className="mb-4">
                <h3 className="text-primary">Đơn thuốc</h3>
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
                        {prescriptions.length > 0 ? (
                            prescriptions.map((presc, index) => (
                                <tr key={index}>
                                    <td>{presc.medicineName}</td>
                                    <td>{presc.unit}</td>
                                    <td>{presc.quantity}</td>
                                    <td>{presc.usage}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    Không có đơn thuốc
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Chẩn đoán */}
            <div className="mb-4">
                <h3 className="text-primary">Chẩn đoán bệnh</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Chẩn đoán</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diagnosisDetails.length > 0 ? (
                            diagnosisDetails.map((dd, index) => (
                                <React.Fragment key={index}>
                                    {renderReadOnlyField("Tên bệnh", dd.diseaseName)}
                                    {renderReadOnlyField("Mức độ nghiêm trọng", dd.severity)}
                                    {renderReadOnlyField("Kế hoạch điều trị", dd.treatmentPlan)}
                                    {renderReadOnlyField("Lịch tái khám", dd.followUpSchedule)}
                                    {renderReadOnlyField("Hướng dẫn đặc biệt", dd.specialInstructions)}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">
                                    Không có thông tin chẩn đoán
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MedicalHistoryDetail;
