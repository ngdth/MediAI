import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = ({ onRegistering }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmedPassword: "",
        phone: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [emptyFields, setEmptyFields] = useState({
        username: false,
        email: false,
        password: false,
        confirmedPassword: false,
        gender: false,
    });
    const [invalidFields, setInvalidFields] = useState({
        username: false,
        email: false,
        password: false,
        confirmedPassword: false,
        phone: false,
        gender: false,
    });

    // Regex cho mật khẩu: ít nhất 1 chữ in hoa, 1 số, cho phép ký tự đặc biệt, dài 6-24
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{6,24}$/;
    // Regex cho email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Regex cho số điện thoại
    const phoneRegex = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
    // Regex cho tên: chữ cái (bao gồm tiếng Việt) và dấu cách, dài 2-50 ký tự
    const usernameRegex = /^[a-zA-Z\s\u00C0-\u1EF9]{2,50}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Reset lỗi trống và lỗi định dạng khi người dùng nhập
        setEmptyFields((prev) => ({ ...prev, [name]: !value }));
        setInvalidFields((prev) => ({ ...prev, [name]: false }));
        setFormError("");

        // Real-time validation
        if (name === "username" && value && !usernameRegex.test(value)) {
            setInvalidFields((prev) => ({ ...prev, username: true }));
            setFormError("Tên chỉ được chứa chữ cái và dấu cách.");
        }
        if (name === "email" && value && !emailRegex.test(value)) {
            setInvalidFields((prev) => ({ ...prev, email: true }));
            setFormError("Vui lòng nhập email hợp lệ.");
        }
        if (name === "password" && value && !passwordRegex.test(value)) {
            setInvalidFields((prev) => ({ ...prev, password: true }));
            setFormError(
                "Mật khẩu phải dài 6-24 ký tự, bao gồm chữ cái, số, ít nhất 1 chữ in hoa."
            );
        }
        if (name === "confirmedPassword" && value && formData.password !== value) {
            setInvalidFields((prev) => ({ ...prev, confirmedPassword: true }));
            setFormError("Mật khẩu xác nhận không khớp.");
        }
        if (name === "phone" && value && !phoneRegex.test(value)) {
            setInvalidFields((prev) => ({ ...prev, phone: true }));
            setFormError("Số điện thoại không hợp lệ.");
        }
        if (name === "gender" && !value) {
            setInvalidFields((prev) => ({ ...prev, gender: true }));
            setFormError("Vui lòng chọn giới tính.");
        }
    };

    const validatePassword = (password) => {
        if (!passwordRegex.test(password)) {
            return "Mật khẩu phải dài 6-24 ký tự, bao gồm chữ cái, số, ít nhất 1 chữ in hoa.";
        }
        return "";
    };

    const validateEmail = (email) => {
        if (!emailRegex.test(email)) {
            return "Vui lòng nhập email hợp lệ.";
        }
        return "";
    };

    const validatePhone = (phone) => {
        if (phone && !phoneRegex.test(phone)) {
            return "Số điện thoại không hợp lệ.";
        }
        return "";
    };

    const validateUsername = (username) => {
        if (!usernameRegex.test(username)) {
            return "Tên chỉ được chứa chữ cái và dấu cách";
        }
        return "";
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
        setFormError("");
        setEmptyFields({
            username: false,
            email: false,
            password: false,
            confirmedPassword: false,
            gender: false,
        });
        setInvalidFields({
            username: false,
            email: false,
            password: false,
            confirmedPassword: false,
            phone: false,
            gender: false,
        });

        // Kiểm tra các trường yêu cầu trống
        const newEmptyFields = {
            username: !formData.username,
            email: !formData.email,
            password: !formData.password,
            confirmedPassword: !formData.confirmedPassword,
            gender: !formData.gender,
        };
        const hasEmptyFields = Object.values(newEmptyFields).some((isEmpty) => isEmpty);
        if (hasEmptyFields) {
            setFormError("Không được để trống");
            setEmptyFields(newEmptyFields);
            return;
        }

        // Validate username
        const usernameValidationError = validateUsername(formData.username);
        if (usernameValidationError) {
            setFormError(usernameValidationError);
            setInvalidFields((prev) => ({ ...prev, username: true }));
            return;
        }

        // Validate email
        const emailValidationError = validateEmail(formData.email);
        if (emailValidationError) {
            setFormError(emailValidationError);
            setInvalidFields((prev) => ({ ...prev, email: true }));
            return;
        }

        // Validate password
        const passwordValidationError = validatePassword(formData.password);
        if (passwordValidationError) {
            setFormError(passwordValidationError);
            setInvalidFields((prev) => ({ ...prev, password: true }));
            return;
        }

        // Validate confirmedPassword
        if (formData.password !== formData.confirmedPassword) {
            setFormError("Mật khẩu xác nhận không khớp.");
            setInvalidFields((prev) => ({ ...prev, confirmedPassword: true }));
            return;
        }

        // Validate phone (nếu có)
        const phoneValidationError = validatePhone(formData.phone);
        if (phoneValidationError) {
            setFormError(phoneValidationError);
            setInvalidFields((prev) => ({ ...prev, phone: true }));
            return;
        }

        // Chuẩn hóa tên trước khi gửi
        const capitalizedUsername = capitalizeName(formData.username);

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: capitalizedUsername,
                    email: formData.email,
                    password: formData.confirmedPassword,
                    phone: formData.phone,
                    gender: formData.gender,
                }),
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem("unverifiedEmail", formData.email);
                onRegistering(result.email);
                navigate("/verify");
            } else {
                setFormError(result.message || "Đăng ký thất bại.");
            }
        } catch (err) {
            setFormError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
        setLoading(false);
    };

    return (
        <Container className="justify-content-center">
            <Row>
                <Col md={12}>
                    <h3 className="text-center mb-3">Đăng ký tài khoản</h3>

                    {formError && <Alert variant="danger">{formError}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Họ và tên"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{ borderColor: emptyFields.username || invalidFields.username ? "red" : "" }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="example@domain.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ borderColor: emptyFields.email || invalidFields.email ? "red" : "" }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ borderColor: emptyFields.password || invalidFields.password ? "red" : "" }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmedPassword"
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmedPassword}
                                onChange={handleChange}
                                required
                                style={{
                                    borderColor: emptyFields.confirmedPassword || invalidFields.confirmedPassword ? "red" : "",
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                // pattern="^(\+84|0)(3|5|7|8|9)[0-9]{8}$"
                                style={{ borderColor: invalidFields.phone ? "red" : "" }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                style={{ borderColor: emptyFields.gender || invalidFields.gender ? "red" : "" }}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="text-center">
                            <Button
                                type="submit"
                                className="cs_btn cs_style_1 cs_color_1"
                                style={{ border: "none", outline: "none" }}
                                disabled={loading}
                            >
                                {loading ? "Đang Gửi Mã OTP..." : "Tạo Tài Khoản"}
                            </Button>
                        </div>

                        <p className="text-muted text-center mt-2 small">
                            Đã có tài khoản?{" "}
                            <Link className="text-decoration-underline text-primary" to="/login">
                                Đăng nhập
                            </Link>{" "}
                            |{" "}
                            <Link className="text-decoration-underline text-primary" to="/">
                                Trang Chủ
                            </Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterForm;