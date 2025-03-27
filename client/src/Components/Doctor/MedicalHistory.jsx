// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './DoctorAppointmentHistory.css';

// const DoctorAppointmentHistory = () => {
//     const [appointments, setAppointments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [filterStatus, setFilterStatus] = useState('');
//     const navigate = useNavigate();

//     const fetchAppointments = async () => {
//         try {
//             setLoading(true);
//             let response;

//             // Sử dụng API getPrescriptionCreatedAppointments nếu lọc theo đơn thuốc đã tạo
//             if (filterStatus === 'DONE') {
//                 response = await axios.get('http://localhost:8080/appointment/prescription-created', {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//             } else {
//                 // Sử dụng API viewAllAppointments với doctorId từ localStorage
//                 const doctorId = localStorage.getItem('doctorId');
//                 response = await axios.get(`http://localhost:8080/appointment/all?doctorId=${doctorId}${filterStatus ? `&status=${filterStatus}` : ''}`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//             }

//             setAppointments(response.data.data);
//             setLoading(false);
//         } catch (err) {
//             setError('Error fetching appointment history');
//             console.error(err);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchAppointments();
//     }, [filterStatus]);

//     const handleFilterChange = (e) => {
//         setFilterStatus(e.target.value);
//     };

//     const handleViewDetail = (appointmentId) => {
//         navigate(`/doctor/appointment-details/${appointmentId}`);
//     };

//     if (loading) return <div className="loading-container">Loading...</div>;
//     if (error) return <div className="error-container">{error}</div>;

//     return (
//         <div className="container">
//             <h2 className="text-center mb-4">Lịch sử khám bệnh</h2>

//             <div className="filter-container">
//                 <label htmlFor="status-filter">Lọc theo trạng thái:</label>
//                 <select
//                     id="status-filter"
//                     value={filterStatus}
//                     onChange={handleFilterChange}
//                     className="status-filter"
//                 >
//                     <option value="">Tất cả trạng thái</option>
//                     <option value="PENDING">Chờ xử lý</option>
//                     <option value="ASSIGNED">Đã phân công</option>
//                     <option value="ACCEPTED">Đã chấp nhận</option>
//                     <option value="WAITINGPRESCRIPTION">Chờ kê đơn</option>
//                     <option value="PRESCRIPTION_CREATED">Đã kê đơn</option>
//                     <option value="DONE">Hoàn thành</option>
//                 </select>
//             </div>

//             {appointments.length === 0 ? (
//                 <div className="no-data">Không có lịch sử khám bệnh nào.</div>
//             ) : (
//                 <table className="appointment-table">
//                     <thead>
//                         <tr>
//                             <th>Tên bệnh nhân</th>
//                             <th>Ngày khám</th>
//                             <th>Giờ khám</th>
//                             <th>Trạng thái</th>
//                             <th>Chi tiết</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {appointments.map((item) => {
//                             const appointment = item.appointment;
//                             return (
//                                 <tr key={appointment._id}>
//                                     <td>{appointment.patientName}</td>
//                                     <td>{new Date(appointment.date).toLocaleDateString('vi-VN')}</td>
//                                     <td>{appointment.time}</td>
//                                     <td>
//                                         <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
//                                             {appointment.status}
//                                         </span>
//                                     </td>
//                                     <td>
//                                         <button
//                                             className="view-detail-btn"
//                                             onClick={() => handleViewDetail(appointment._id)}
//                                         >
//                                             Xem chi tiết
//                                         </button>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default DoctorAppointmentHistory;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const MedicalHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/pharmacy/appointments/done`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointments(response.data.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
    };

    // Lọc theo search term
    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patientName?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="pending">
            <Row className="justify-content-between">
                <Col md={6}>
                    <h2>Lịch sử khám bệnh</h2>
                </Col>
                <Col md={4}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bệnh nhân"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="form-control mb-3"
                    />
                </Col>
            </Row>

            <table className="table">
                <thead>
                    <tr>
                        <th className="text-center">Bệnh Nhân</th>
                        <th className="text-center">Ngày Khám</th>
                        <th className="text-center">Giờ khám</th>
                        <th className="text-center">Trạng Thái</th>
                        <th className="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="text-center">Đang tải dữ liệu...</td>
                        </tr>
                    ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
                            <tr key={appointment._id}>
                                <td className="text-center">{appointment.patientName}</td>
                                <td className="text-center">{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                <td className="text-center">{appointment.time}</td>
                                <td className="text-center">{appointment.status}</td>
                                <td className="text-center">
                                    <Link to={`/doctor/medical-history-detail/${appointment._id}`} className="btn btn-primary">
                                        Chi tiết
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">Không có lịch sử khám nào của bệnh nhân.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MedicalHistory;
