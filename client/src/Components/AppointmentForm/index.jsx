import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const hospitals = ["Bệnh viện Quốc tế Hạnh Phúc", "Bệnh viện Thuận Mỹ ITO Đồng Nai", "Bệnh viện Hoàn Mỹ Sài Gòn", "Phòng khám Thuận Mỹ Sài Gòn", "Phòng khám Quốc tế Hạnh Phúc (Estella)"];
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

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/');
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

                    {/* Đưa ngày sinh và giới tính lên cùng hàng */}
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
        </div>
    );
};

export default AppointmentForm;
