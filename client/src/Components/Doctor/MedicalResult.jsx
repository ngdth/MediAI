import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MedicalResult = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [doctorRole, setDoctorRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDoctorId(response.data.id);
                setDoctorRole(response.data.role);
            } catch (error) {
                console.error("Error fetching doctor ID:", error);
                setLoading(false);
            }
        };

        fetchDoctorId();
    }, [token]);

    useEffect(() => {
        const fetchWaitingAppointments = async () => {
            if (!doctorId) return;

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BE_URL}/appointment/waiting?doctorId=${doctorId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log("Appointments data:", response.data);
                const filteredAppointments = (response.data.data || []).filter((item) => {
                    const appointment = item.appointment;
                    const doctorIds = appointment.doctorId || [];
                    const lastDoctor = doctorIds.length > 0 ? doctorIds[doctorIds.length - 1] : null;
                    const lastDoctorId = lastDoctor && typeof lastDoctor === "object" ? lastDoctor._id : lastDoctor;
                    return lastDoctorId === doctorId;
                });

                setAppointments(filteredAppointments);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching waiting appointments:", error);
                console.log("Error response:", error.response);
                setAppointments([]);
                setLoading(false);
            }
        };

        fetchWaitingAppointments();
    }, [doctorId, token]);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedAppointments = React.useMemo(() => {
        const sortableAppointments = [...appointments];
        if (!sortConfig.key) return sortableAppointments;

        sortableAppointments.sort((a, b) => {
            const appointmentA = a.appointment;
            const appointmentB = b.appointment;
            const diagnosisA = a.diagnosisDetails && a.diagnosisDetails.length > 0 
                ? a.diagnosisDetails[a.diagnosisDetails.length - 1] 
                : {};
            const diagnosisB = b.diagnosisDetails && b.diagnosisDetails.length > 0 
                ? b.diagnosisDetails[b.diagnosisDetails.length - 1] 
                : {};

            if (sortConfig.key === "patientName") {
                return sortConfig.direction === "asc"
                    ? (appointmentA.patientName || "").localeCompare(appointmentB.patientName || "")
                    : (appointmentB.patientName || "").localeCompare(appointmentA.patientName || "");
            }

            if (sortConfig.key === "date") {
                const aDate = new Date(appointmentA.date);
                const bDate = new Date(appointmentB.date);
                return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
            }

            if (sortConfig.key === "time") {
                return sortConfig.direction === "asc"
                    ? (appointmentA.time || "").localeCompare(appointmentB.time || "")
                    : (appointmentB.time || "").localeCompare(appointmentA.time || "");
            }

            if (sortConfig.key === "symptoms") {
                return sortConfig.direction === "asc"
                    ? (appointmentA.symptoms || "").localeCompare(appointmentB.symptoms || "")
                    : (appointmentB.symptoms || "").localeCompare(appointmentA.symptoms || "");
            }

            if (sortConfig.key === "diseaseName") {
                return sortConfig.direction === "asc"
                    ? (diagnosisA.diseaseName || "").localeCompare(diagnosisB.diseaseName || "")
                    : (diagnosisB.diseaseName || "").localeCompare(diagnosisA.diseaseName || "");
            }

            if (sortConfig.key === "severity") {
                return sortConfig.direction === "asc"
                    ? (diagnosisA.severity || "").localeCompare(diagnosisB.severity || "")
                    : (diagnosisB.severity || "").localeCompare(diagnosisA.severity || "");
            }

            if (sortConfig.key === "treatmentPlan") {
                return sortConfig.direction === "asc"
                    ? (diagnosisA.treatmentPlan || "").localeCompare(diagnosisB.treatmentPlan || "")
                    : (diagnosisB.treatmentPlan || "").localeCompare(diagnosisA.treatmentPlan || "");
            }

            return 0;
        });
        return sortableAppointments;
    }, [appointments, sortConfig]);

    return (
        <div className="container">
            <h2 className="text-center mt-4 mb-4">Kết quả khám bệnh</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th>#</th>
                            <th>
                                <span onClick={() => handleSort("patientName")} style={{ cursor: "pointer" }}>
                                    Bệnh nhân{" "}
                                    {sortConfig.key === "patientName" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                                    Ngày khám{" "}
                                    {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("time")} style={{ cursor: "pointer" }}>
                                    Giờ khám{" "}
                                    {sortConfig.key === "time" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("symptoms")} style={{ cursor: "pointer" }}>
                                    Triệu chứng{" "}
                                    {sortConfig.key === "symptoms" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("diseaseName")} style={{ cursor: "pointer" }}>
                                    Chẩn đoán bệnh{" "}
                                    {sortConfig.key === "diseaseName" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("severity")} style={{ cursor: "pointer" }}>
                                    Mức độ nghiêm trọng{" "}
                                    {sortConfig.key === "severity" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>
                                <span onClick={() => handleSort("treatmentPlan")} style={{ cursor: "pointer" }}>
                                    Phương án điều trị{" "}
                                    {sortConfig.key === "treatmentPlan" &&
                                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                                </span>
                            </th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((item, index) => {
                                const appointment = item.appointment;
                                const diagnosis =
                                    item.diagnosisDetails && item.diagnosisDetails.length > 0
                                        ? item.diagnosisDetails[item.diagnosisDetails.length - 1]
                                        : null;

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
                                            <Link
                                                to={doctorRole === "head of department"
                                                    ? `/hod/manage-prescription/${appointment._id}`
                                                    : `/doctor/manage-prescription/${appointment._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Tạo đơn thuốc
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    Không có lịch hẹn nào đang chờ xử lý.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MedicalResult;