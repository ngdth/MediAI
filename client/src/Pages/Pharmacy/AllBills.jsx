import React, { useState, useEffect } from "react";
import axios from "axios";
import { Col, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const AllBills = () => {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/pharmacy/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setBills(response.data.bills);
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
    };

    // Lọc theo search term
    const filteredBills = bills.filter((bill) =>
        bill.patientName?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="pending">
            <Row className="justify-content-between">
                <Col md={6}>
                    <h2>Tất cả hóa đơn</h2>
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
                        <th className="text-center">Trạng thái</th>
                        {/* <th className="text-center">Giờ khám</th> */}
                        <th className="text-center">Thao tác </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="text-center">Đang tải dữ liệu...</td>
                        </tr>
                    ) : filteredBills.length > 0 ? (
                        filteredBills.map((bill) => (
                            <tr key={bill._id}>
                                <td className="text-center">{bill.patientName}</td>
                                <td className="text-center">{new Date(bill.dateIssued).toLocaleDateString("vi-VN")}</td>
                                <td className="text-center">{bill.paymentStatus}</td>
                                {/* <td className="text-center">{appointment.time}</td> */}
                                <td className="text-center">
                                    <Link to={`/pharmacy/bill/${bill._id}`} className="btn btn-primary">
                                       Chi tiết 
                                    </Link>
                                    {/* <Button variant="primary">
                                        Chi tiết
                                    </Button> */}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">Không có đơn thuốc nào đang chờ duyệt.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AllBills;
