import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";

const ProfileForm = ({ user, setUser }) => {
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        birthday: user?.birthday || null,
        gender: user?.gender || "",
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                birthday: user.birthday ? new Date(user.birthday) : null,
                gender: user.gender || "",
                address: user.address || "",
                city: user.city || "",
                country: user.country || "",
                phone: user.phone || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setIsFormChanged(true);
    };

    const handleDateChange = (date) => {
        setFormData((prevState) => ({
            ...prevState,
            birthday: date,
        }));
        setIsFormChanged(true);
    };

    const validateFormData = (data) => {
        const errors = [];
        if (data.username && !/^[a-zA-Z\s\u00C0-\u1EF9]{2,50}$/.test(data.username)) {
            errors.push("Tên người dùng chỉ được chứa chữ cái và khoảng trắng.");
        }
        if (data.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
            errors.push("Vui lòng nhập địa chỉ email hợp lệ.");
        }
        if (data.gender && !["Nam", "Nữ"].includes(data.gender)) {
            errors.push("Giới tính phải là 'Nam' hoặc 'Nữ'.");
        }
        if (data.phone && !/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/.test(data.phone)) {
            errors.push("Vui lòng nhập số điện thoại hợp lệ");
        }
        if (data.address && data.address.length > 100) {
            errors.push("Địa chỉ không được vượt quá 100 ký tự.");
        }
        if (data.city && data.city.length > 50) {
            errors.push("Thành phố không được vượt quá 50 ký tự.");
        }
        if (data.country && data.country.length > 50) {
            errors.push("Quốc gia không được vượt quá 50 ký tự.");
        }
        if (data.bio && data.bio.length > 1000) {
            errors.push("Tiểu sử không được vượt quá 1000 ký tự.");
        }
        return errors;
    };

    const capitalizeName = (name) => {
        return name
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Bạn phải đăng nhập để cập nhật hồ sơ");
            return;
        }

        // Validate form data
        const validationErrors = validateFormData(formData);
        if (validationErrors.length > 0) {
            toast.error(validationErrors.join(" "));
            return;
        }

        // Chuẩn hóa tên và chuẩn bị dữ liệu gửi đi
        const submissionData = {
            ...formData,
            username: formData.username ? capitalizeName(formData.username) : formData.username,
            birthday: formData.birthday ? formData.birthday.toISOString() : undefined,
        };

        try {
            const response = await axios.put(
                `http://localhost:8080/user/updateProfile/${user._id}`,
                submissionData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                toast.success("Cập nhật hồ sơ thành công!");
                localStorage.setItem("username", submissionData.username);
                const updatedUserResponse = await axios.get("http://localhost:8080/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(updatedUserResponse.data.user);
                setIsFormChanged(false);
                setTimeout(() => {
                    window.location.reload();
                }, 6000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
            toast.error(errorMessage);
        }
    };

    if (!user) return <div></div>;

    return (
        <Container className="card-body p-4" style={{ backgroundColor: "#F7FAFC" }}>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Địa chỉ email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Ngày sinh</Form.Label>
                            <DatePicker
                                selected={formData.birthday}
                                onChange={handleDateChange}
                                dateFormat="dd-MM-yyyy"
                                className="form-control"
                                placeholderText="dd-mm-yyyy"
                                maxDate={new Date()}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <hr className="my-3" />

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Thành phố</Form.Label>
                            <Form.Control
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Quốc gia</Form.Label>
                            <Form.Control
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Form.Group>
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                {["nurse", "doctor", "head of department"].includes(user.role) && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>Bio</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <div className="text-end">
                    <Button type="submit" className="cs_btn cs_style_1 cs_color_1" disabled={!isFormChanged}>
                        Cập nhật thông tin
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default ProfileForm;