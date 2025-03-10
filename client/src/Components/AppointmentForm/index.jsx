import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios"

const hospitals = ["Phòng khám Y Khoa AMMA"];
const specialties = ["Cấp cứu", "Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];

const AppointmentForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: null,
        gender: '',
        hospital: '',
        specialty: '',
        additionalInfo: '',
        appointmentDate: null,
        appointmentTime: ''
    });

    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateOfBirthChange = (date) => {
        setFormData({ ...formData, dateOfBirth: date });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, appointmentDate: date });
    };

    const today = new Date();

    // ✅ Gửi API đặt lịch khám
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token"); // ✅ Lấy token từ localStorage

            if (!token) {
                alert("Bạn cần đăng nhập trước khi đặt lịch.");
                return;
            }

            const response = await axios.post(`http://localhost:8080/api/book`, {
                patientName: formData.fullName,
                date: formData.appointmentDate.toISOString().split("T")[0],
                time: formData.appointmentTime,
                symptoms: formData.specialty
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setShowPopup(true);
                setTimeout(() => {
                    navigate('/'); // ✅ Tự động về trang chủ sau 15s
                }, 15000);
            }
        } catch (error) {
            console.error("Lỗi đặt lịch:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <div className="appointment-container">
            <div className="appointment-form">
                <form onSubmit={handleSubmit}>

                    <h3>Thông tin bệnh nhân</h3>
                    <input className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên" required />
                    <input className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" required />
                    <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <input className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" required />

                    <div className="dob-gender-container">
                        <DatePicker
                            selected={formData.dateOfBirth}
                            onChange={handleDateOfBirthChange}
                            dateFormat="dd/MM/yyyy"
                            maxDate={today}
                            className="form-control dob-input"
                            placeholderText="Chọn ngày sinh"
                        />

                        <div className="gender-selection">
                            <label className="gender-label">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Nam"
                                    checked={formData.gender === "Nam"}
                                    onChange={handleChange}
                                />
                                <span className="custom-radio"></span>
                                Nam
                            </label>
                            <label className="gender-label">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Nữ"
                                    checked={formData.gender === "Nữ"}
                                    onChange={handleChange}
                                />
                                <span className="custom-radio"></span>
                                Nữ
                            </label>
                        </div>
                    </div>

                    <h3>Chọn chuyên khoa</h3>
                    <select className="form-select" name="hospital" value={formData.hospital} onChange={handleChange} required>
                        <option value="">Bệnh Viện hoặc Phòng Khám</option>
                        {hospitals.map((hospital, idx) => <option key={idx}>{hospital}</option>)}
                    </select>
                    <select className="form-select" name="specialty" value={formData.specialty} onChange={handleChange} required>
                        <option value="">Chuyên Khoa</option>
                        {specialties.map((specialty, idx) => <option key={idx}>{specialty}</option>)}
                    </select>

                    <h3>Ngày và giờ thích hợp</h3>
                    <DatePicker
                        selected={formData.appointmentDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        minDate={today}
                        className="form-control"
                        placeholderText="Chọn ngày"
                    />

                    <select className="form-select" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required>
                        <option value="">Chọn giờ</option>
                        {[...Array(9)].map((_, i) => {
                            const hour = 8 + i;
                            return (
                                <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                    {`${hour.toString().padStart(2, "0")}:00`}
                                </option>
                            );
                        })}
                    </select>

                    <button className="btn btn-primary" type="submit">Đăng ký</button>
                </form>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <span className="close-btn" onClick={() => navigate('/')}>✖</span>
                        <div className="checkmark">✔</div>
                        <h2>Đã đăng ký</h2>
                        <p>
                            Cảm ơn bạn đã đăng ký cuộc hẹn tại <b>{formData.hospital || "Bệnh Viện hoặc Phòng Khám"}</b>
                            vào <b>{formData.appointmentDate ? formData.appointmentDate.toLocaleDateString("vi-VN") : "Chưa chọn ngày"} {formData.appointmentTime}</b>.
                            Chúng tôi sẽ sớm liên lạc với bạn trong vòng 24 giờ để xác nhận lịch hẹn. Xin cảm ơn.
                        </p>
                        <button onClick={() => navigate('/')}>Trở về trang chủ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentForm;
