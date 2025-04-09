import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios";

const specialties = ["Chẩn đoán hình ảnh", "Chấn thương chỉnh hình", "Da liễu", "Hô hấp", "Nhãn khoa", "Nhi khoa", "Nội tiết", "Nội tổng quát", "Sản phụ", "Sơ sinh", "Tai Mũi Họng (hay ENT)", "Thận", "Thần kinh", "Tiết niệu", "Tim mạch", "Ung thư", "Cơ xương khớp", "Hậu môn trực tràng"];

const AppointmentForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: null,
        gender: '',
        specialty: '',
        additionalInfo: '',
        appointmentDate: null,
        appointmentTime: ''
    });

    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found, user not logged in.");
                    return;
                }

                const response = await axios.get('http://localhost:8080/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const user = response.data.user || response.data;

                setFormData((prevData) => ({
                    ...prevData,
                    fullName: user.firstName && user.lastName ? `${user.lastName} ${user.firstName}` : '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    dateOfBirth: user.birthday ? new Date(user.birthday) : null,
                    gender: user.gender || '',
                }));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

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

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Bạn cần đăng nhập trước khi đặt lịch.");
                return;
            }

            const formattedDate = formData.appointmentDate.toLocaleDateString('en-CA');
            const age = calculateAge(formData.dateOfBirth);
            
            const response = await axios.post(
                `http://localhost:8080/appointment/booknodoctor`,
                {
                    patientName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    gender: formData.gender,
                    age: age,
                    date: formattedDate,
                    time: formData.appointmentTime,
                    symptoms: formData.specialty,

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 201) {
                setShowPopup(true);
                setTimeout(() => {
                    navigate('/');
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
                            Cảm ơn bạn đã đăng ký cuộc hẹn vào <b>{formData.appointmentDate ? formData.appointmentDate.toLocaleDateString("vi-VN") : "Chưa chọn ngày"} {formData.appointmentTime}</b>.
                            Chúng tôi sẽ sớm liên lạc với bạn trong vòng 24 giờ để xác nhận lịch hẹn. Xin cảm ơn.
                        </p>
                        <button className="btn-home" onClick={() => navigate('/')}>Trở về trang chủ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentForm;