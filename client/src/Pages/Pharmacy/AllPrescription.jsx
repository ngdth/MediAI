import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row } from "react-bootstrap";

const AllPrescription = () => {
    const [appointments, setAppointments] = useState([]);
    // const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments("Prescription_created");
        // fetchDoctors();
    }, []);

    const fetchAppointments = async (status) => {
        try {
            const response = await axios.get(`http://localhost:8080/appointment?status=${status}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAppointments(response.data.data); // Assuming API returns data in response.data.data
            setLoading(false);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    // const fetchDoctors = async () => {
    //   try {
    //     const response = await axios.get("http://localhost:8080/user/doctors", {
    //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //     });
    //     setDoctors(response.data); // Assuming doctors data is directly under response.data
    //   } catch (error) {
    //     console.error("Error fetching doctors:", error);
    //   }
    // };

    // Hàm cập nhật trạng thái cuộc hẹn (Assign hoặc Reject)
    // const updateAppointmentStatus = async (id, status) => {
    //   try {
    //     await axios.put(`http://localhost:8080/appointment/${id}/status`, { status }, {
    //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //     });
    //     console.log("Appointment status updated successfully", status);
    //     fetchAppointments();  // Refresh the appointment list after updating status
    //   } catch (error) {
    //     console.error("Error updating appointment status:", error);
    //   }
    // };

    // Hàm gán bác sĩ cho cuộc hẹn
    // const assignDoctor = async (id, doctorId) => {
    //   try {
    //     await axios.put(`http://localhost:8080/appointment/${id}/assign`, { doctorId }, {
    //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //     });
    //     fetchAppointments();  // Refresh the appointment list after assigning doctor
    //   } catch (error) {
    //     console.error("Error assigning doctor:", error);
    //   }
    // };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = appointments.filter((appointment) => appointment.patientName.toLowerCase().includes(value));
        setFilteredAppointments(filtered);
    };

    return (
        <div className="pending">
            <Row className="justify-content-between">
                <Col md={6}>
                    <h2>Tất cả đơn thuốc</h2>
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

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th className="text-center">Bệnh Nhân</th>
                            <th className="text-center">Ngày Khám</th>
                            <th className="text-center">Giờ khám</th>
                            <th className="text-center">Action</th>
                            {/* <th>Bác sĩ</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patientName}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString("vi-VN")}</td>
                                    <td>{appointment.time}</td>
                                    {/* <td>
                    <select className="form-select" onChange={(e) => assignDoctor(appointment._id, e.target.value)}>
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.username} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </td> */}
                                    <td>
                                        <Link to={`/prescription/${appointment._id}`} className="btn btn-primary">
                                            Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Không có đơn thuốc nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllPrescription;
