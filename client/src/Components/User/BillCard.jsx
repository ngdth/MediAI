"use client";

import { Link } from "react-router-dom";

export default function BillCard({ bill, onPayBill }) {
    const { dateIssued, totalAmount, paymentStatus, createdAt, patientName, userId} = bill;
    const { time } = bill.appointmentId;

    console.log("BillCard props:", bill);
    console.log("userId:", userId);

    // Hàm định dạng thời gian từ createdAt
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Sử dụng định dạng 24h
        });
    };

    // Lấy thời gian từ createdAt
    const formattedCreatedAt = formatTime(createdAt);

    const formattedDate = new Date(dateIssued).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className={`bill-card ${paymentStatus} `}>
            <div className="bill-header">
                <h2>{formattedDate}</h2>
                <span className={`status-badge ${paymentStatus}`}>
                    {paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
            </div>

            <div className="bill-details">
                <div className="detail-item">
                    <span className="label">Bệnh nhân:</span>
                    <span className="totalAmount">{patientName}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Giờ khám:</span>
                    <span>{time}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Giờ tạo:</span>
                    <span>{formattedCreatedAt}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Giá tiền:</span>
                    <span className="totalAmount">{totalAmount} VND</span>
                </div>
            </div>

            {paymentStatus === "Unpaid" && (
                <div className="bill-actions">
                    <button className="pay-button" onClick={() => onPayBill(bill)}>
                        Thanh Toán
                    </button>
                    <Link to={`/payment-detail/${bill._id}`} className="details-button text-center">
                        Xem chi tiết
                    </Link>
                </div>
            )}

            {paymentStatus === "Paid" && (
                <div className="bill-actions">
                    <Link to={`/payment-detail/${bill._id}`} className="details-button text-center">
                        Xem chi tiết
                    </Link>
                </div>
            )}
        </div>
    );
}
