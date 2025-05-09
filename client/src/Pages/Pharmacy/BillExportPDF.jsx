import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { DejaVuSansBase64 } from "../../fonts"; // Giữ đường dẫn bạn cung cấp

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
            doc.setFontSize(20);
            doc.text("HÓA ĐƠN Y TẾ", 20, 20);
            doc.setFontSize(12);
            doc.text(`Mã hóa đơn: ${bill._id || "N/A"}`, 20, 30);
            doc.text(`Ngày phát hành: ${bill.dateIssued ? new Date(bill.dateIssued).toLocaleDateString("vi-VN") : "N/A"}`, 20, 38);

            // Trạng thái với biểu tượng dấu kiểm xanh
            doc.setTextColor(0, 128, 0); // Màu xanh
            doc.text(`Trạng thái: Đã thanh toán`, 20, 46);
            doc.setFillColor(0, 128, 0);
            // doc.circle(50, 44.5, 1, "F"); // Vẽ dấu kiểm (hình tròn xanh nhỏ)
            doc.setTextColor(0, 0, 0); // Đặt lại màu đen

            // Thông tin khám bệnh
            doc.setFontSize(14);
            doc.text("Thông tin khám bệnh", 20, 58);
            doc.setFontSize(10);
            doc.text(`Họ và tên người bệnh: ${bill.patientName || "N/A"}`, 20, 68);
            doc.text(`Ngày khám: ${appointment.date ? new Date(appointment.date).toLocaleDateString("vi-VN") : "N/A"}`, 20, 76);
            doc.text(`Triệu chứng: ${appointment.symptoms || "N/A"}`, 20, 84);
            doc.text(`Tuổi: ${appointment.age || "N/A"}`, 20, 92);
            doc.text(`Giới tính: ${appointment.gender || "N/A"}`, 20, 100);
            doc.text(`Địa chỉ: ${appointment.address || "N/A"}`, 20, 108);

            // Kết quả khám bệnh
            doc.setFontSize(14);
            let yPos = 122;
            doc.text("Kết quả khám bệnh", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            if (Array.isArray(diagnosisDetails) && diagnosisDetails.length > 0) {
                diagnosisDetails.forEach((diagnosis, index) => {
                    if (diagnosisDetails.length > 1) {
                        doc.text(`Kết quả khám bệnh ${index + 1}`, 20, yPos);
                        yPos += 8;
                    }
                    autoTable(doc, {
                        startY: yPos,
                        head: [["Nội dung", "Thông tin"]],
                        body: [
                            ["Chẩn đoán bệnh", diagnosis.diseaseName || "Không có thông tin"],
                            ["Mức độ nghiêm trọng", diagnosis.severity || "Không có thông tin"],
                            ["Phương án điều trị", diagnosis.treatmentPlan || "Không có thông tin"],
                            ["Bác sĩ đưa kết quả", diagnosis.doctorId?.username || "Không có thông tin"],
                        ],
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
                            data.cell.styles.font = "DejaVuSans"; // Ép font cho mọi ô
                            console.log("Cell font:", data.cell.styles.font);
                        },
                    });
                    yPos = doc.lastAutoTable.finalY + 10;
                });
            } else {
                doc.text("Không có thông tin chẩn đoán", 20, yPos);
                yPos += 8;
            }

            // Thông tin đơn thuốc
            doc.setFontSize(14);
            doc.text("Thông tin đơn thuốc", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            if (prescriptions && prescriptions.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [["STT", "Tên thuốc", "Đơn vị tính", "Số lượng", "Giá (VND)", "Thành tiền (VND)", "Cách dùng"]],
                    body: prescriptions.map((prescription, index) => {
                        const price = parseInt(prescription.unitPrice) || 0;
                        const quantity = parseInt(prescription.quantity) || 0;
                        const total = price * quantity;
                        return [
                            index + 1,
                            prescription.name || "N/A",
                            prescription.unit || "N/A",
                            prescription.quantity?.toString() || "0",
                            price.toLocaleString("vi-VN"),
                            total.toLocaleString("vi-VN"),
                            prescription.usage || "N/A",
                        ];
                    }),
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
                        data.cell.styles.font = "DejaVuSans"; // Ép font cho mọi ô
                    },
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.text("Khách hàng không lấy thuốc", 20, yPos);
                yPos += 8;
            }

            // Thông tin dịch vụ khám
            doc.setFontSize(14);
            doc.text("Thông tin dịch vụ khám", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            if (services && services.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [["STT", "Tên dịch vụ", "Khoa", "Giá tiền (VND)"]],
                    body: services.map((service, index) => [
                        index + 1,
                        service.name || "N/A",
                        service.department || "N/A",
                        service.price?.toLocaleString("vi-VN") || "0",
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
                        data.cell.styles.font = "DejaVuSans"; // Ép font cho mọi ô
                    },
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.text("Không có dịch vụ khám", 20, yPos);
                yPos += 8;
            }

            // Tổng tiền
            doc.setFontSize(14);
            doc.text("Tổng tiền", 20, yPos);
            doc.setFontSize(10);
            yPos += 8;
            doc.text(`Tổng tiền thuốc: ${totalMedicine.toLocaleString("vi-VN")} VND`, 20, yPos);
            yPos += 8;
            doc.text(`Tổng tiền dịch vụ: ${totalService.toLocaleString("vi-VN")} VND`, 20, yPos);
            yPos += 8;

            <hr className="my-3" />

            doc.text(`TỔNG CỘNG: ${totalPayment.toLocaleString("vi-VN")} VND`, 20, yPos);

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
            totalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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