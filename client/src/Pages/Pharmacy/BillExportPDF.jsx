import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { DejaVuSansBase64 } from "../../fonts";

const BillExportPDF = ({ bill, appointment, diagnosisDetails, prescriptions, services, totalMedicine, totalService, totalPayment }) => {
    const exportToPDF = () => {
        try {
            // Kiểm tra trạng thái hóa đơn
            if (bill.paymentStatus !== "Paid") {
                toast.error("Hóa đơn chưa được thanh toán, không thể xuất PDF.");
                return;
            }

            // Khởi tạo jsPDF
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Nhúng font DejaVu Sans
            doc.addFileToVFS("DejaVuSans.ttf", DejaVuSansBase64);
            doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
            doc.setFont("DejaVuSans");

            // Tiêu đề
            doc.setFontSize(16);
            doc.text("HÓA ĐƠN BỆNH VIỆN", 105, 20, { align: "center" });
            doc.setFontSize(10);
            doc.text(`Mã số quản lý hóa đơn: ${bill._id || "N/A"}`, 20, 40);
            doc.text(`Ngày phát hành: ${bill.dateIssued ? new Date(bill.dateIssued).toLocaleDateString("vi-VN") : "N/A"}`, 20, 46);
            doc.setTextColor(0, 128, 0); // Màu xanh lá
            const statusText = `Trạng thái thanh toán: ${bill.paymentStatus === "Paid" ? "Đã thanh toán" : bill.paymentStatus || "N/A"}`;
            doc.text(statusText, 20, 52, { maxWidth: 170 }); // Giới hạn chiều rộng nếu cần
            doc.setTextColor(0, 0, 0); // Trở lại màu đen

            // Thông tin khám bệnh
            doc.setFontSize(12);
            doc.text("I. Thông tin khám bệnh", 20, 58);
            doc.setFontSize(10);
            let yPos = 64;
            doc.text(`(1) Họ và tên người bệnh: ${bill.patientName || "N/A"}`, 20, yPos);
            yPos += 6;
            doc.text(`(2) Ngày khám: ${appointment.date ? new Date(appointment.date).toLocaleDateString("vi-VN") : "N/A"}`, 20, yPos);
            yPos += 6;
            doc.text(`(3) Triệu chứng: ${appointment.symptoms || "N/A"}`, 20, yPos);
            yPos += 6;
            doc.text(`(4) Tuổi: ${appointment.age || "N/A"}`, 20, yPos);
            yPos += 6;
            doc.text(`(5) Giới tính: ${appointment.gender || "N/A"}`, 20, yPos);
            yPos += 6;
            doc.text(`(6) Địa chỉ: ${appointment.address || "N/A"}`, 20, yPos);
            yPos += 10;

            // Kết quả khám bệnh
            doc.setFontSize(12);
            doc.text("II. Kết quả khám bệnh", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            if (Array.isArray(diagnosisDetails) && diagnosisDetails.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [["Nội dung", "Thông tin"]],
                    body: diagnosisDetails.flatMap((diagnosis) => [
                        ["Chẩn đoán bệnh", diagnosis.diseaseName || "Không có thông tin"],
                        ["Mức độ nghiêm trọng", diagnosis.severity || "Không có thông tin"],
                        ["Phương án điều trị", diagnosis.treatmentPlan || "Không có thông tin"],
                        ["Bác sĩ đưa kết quả", diagnosis.doctorId?.username || "Không có thông tin"],
                    ]),
                    styles: { font: "DejaVuSans", fontSize: 10, cellPadding: 2 },
                    headStyles: {
                        font: "DejaVuSans",
                        fontStyle: "normal",
                        fillColor: [0, 123, 255],
                        textColor: [255, 255, 255],
                    },
                    bodyStyles: { font: "DejaVuSans", fontStyle: "normal" },
                    alternateRowStyles: { fillColor: [240, 240, 240] },
                    didParseCell: (data) => {
                        data.cell.styles.font = "DejaVuSans";
                    },
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.text("Không có thông tin chẩn đoán", 20, yPos);
                yPos += 8;
            }

            // Thông tin đơn thuốc và dịch vụ khám (gộp thành một bảng)
            doc.setFontSize(12);
            doc.text("III. Chi phí khám chữa bệnh", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            const tableData = [
                ...(prescriptions.map((prescription, index) => {
                    const price = parseInt(prescription.unitPrice) || 0;
                    const quantity = parseInt(prescription.quantity) || 0;
                    const total = price * quantity;
                    return [
                        `Thuốc ${index + 1}: ${prescription.name || "N/A"}`,
                        prescription.unit || "N/A",
                        quantity.toString(),
                        price.toLocaleString("vi-VN"),
                        total.toLocaleString("vi-VN"),
                        "Khác",
                    ];
                }) || []),
                ...(services.map((service, index) => {
                    const price = parseInt(service.price) || 0;
                    return [
                        `Dịch vụ ${index + 1}: ${service.name || "N/A"}`,
                        "Lần",
                        "1",
                        price.toLocaleString("vi-VN"),
                        price.toLocaleString("vi-VN"),
                        "Khác",
                    ];
                }) || []),
            ];

            if (tableData.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [["Nội dung", "DVT", "Số lượng", "Đơn giá", "Thành tiền", "Nguồn thanh toán"]],
                    body: tableData,
                    styles: { font: "DejaVuSans", fontSize: 10, cellPadding: 2 },
                    headStyles: {
                        font: "DejaVuSans",
                        fontStyle: "normal",
                        fillColor: [0, 123, 255],
                        textColor: [255, 255, 255],
                    },
                    bodyStyles: { font: "DejaVuSans", fontStyle: "normal" },
                    alternateRowStyles: { fillColor: [240, 240, 240] },
                    didParseCell: (data) => {
                        data.cell.styles.font = "DejaVuSans";
                    },
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.text("Không có đơn thuốc hoặc dịch vụ", 20, yPos);
                yPos += 8;
            }

            // Tổng tiền
            doc.setFontSize(12);
            doc.text("IV. Tổng tiền", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            doc.text(`Số tiền bằng chữ: Tổng cộng: ${totalPayment.toLocaleString("vi-VN")} đồng`, 20, yPos);
            yPos += 6;
            doc.text(`Tổng tiền thuốc: ${totalMedicine.toLocaleString("vi-VN")} đồng`, 20, yPos);
            yPos += 6;
            doc.text(`Tổng tiền dịch vụ: ${totalService.toLocaleString("vi-VN")} đồng`, 20, yPos);
            yPos += 6;
            doc.text(`Tổng cộng: ${totalPayment.toLocaleString("vi-VN")} đồng`, 20, yPos);
            yPos += 10;

            // Chữ ký
            doc.setFontSize(12);
            doc.text("NGƯỜI LẬP BẢNG KÊ", 20, yPos);
            doc.text("XÁC NHẬN CỦA NGƯỜI BỆNH", 120, yPos);
            yPos += 20;
            doc.line(20, yPos, 50, yPos); // Dòng chữ ký người lập
            doc.line(120, yPos, 150, yPos); // Dòng chữ ký người bệnh
            yPos += 6;
            doc.text("(Ký, ghi rõ họ tên)", 20, yPos);
            doc.text("(Ký, ghi rõ họ tên)", 120, yPos);

            // Lưu file PDF
            doc.save(`hoa_don_${bill._id || "khong_xac_dinh"}.pdf`);
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            toast.error("Không thể tạo PDF. Vui lòng thử lại.");
        }
    };

    // Chỉ hiển thị nút nếu hóa đơn đã thanh toán
    if (bill.paymentStatus !== "Paid") {
        return null;
    }

    return (
        <Button
            variant="primary"
            onClick={exportToPDF}
            className="d-flex align-items-center gap-2"
        >
            <FaFilePdf /> Xuất hóa đơn
        </Button>
    );
};

// PropTypes để kiểm tra kiểu dữ liệu
BillExportPDF.propTypes = {
    bill: PropTypes.shape({
        _id: PropTypes.string,
        patientName: PropTypes.string,
        paymentStatus: PropTypes.string,
        dateIssued: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    }).isRequired,
    appointment: PropTypes.shape({
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        symptoms: PropTypes.string,
        age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        gender: PropTypes.string,
        address: PropTypes.string,
    }).isRequired,
    diagnosisDetails: PropTypes.arrayOf(
        PropTypes.shape({
            diseaseName: PropTypes.string,
            severity: PropTypes.string,
            treatmentPlan: PropTypes.string,
            doctorId: PropTypes.shape({
                username: PropTypes.string,
            }),
        })
    ).isRequired,
    prescriptions: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            unit: PropTypes.string,
            quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            unitPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            usage: PropTypes.string,
        })
    ).isRequired,
    services: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            department: PropTypes.string,
            price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        })
    ).isRequired,
    totalMedicine: PropTypes.number.isRequired,
    totalService: PropTypes.number.isRequired,
    totalPayment: PropTypes.number.isRequired,
};

export default BillExportPDF;