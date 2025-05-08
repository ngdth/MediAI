import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    validateUsername,
    validateEmail,
    validatePhone,
    validateGender,
    validatePassword,
    validateConfirmedPassword,
} from "../../../utils/validateUtils";

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
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmedPassword: "",
        phone: "",
        gender: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError("");
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));

        // Real-time validation
        if (name === "username" && value) {
            const isValid = validateUsername(value);
            if (!isValid) {
                setFieldErrors((prev) => ({ ...prev, username: "Tên chỉ được chứa chữ cái và dấu cách." }));
            }
        }
        if (name === "email" && value) {
            const isValid = validateEmail(value);
            if (!isValid) {
                setFieldErrors((prev) => ({ ...prev, email: "Vui lòng nhập email hợp lệ." }));
            }
        }
        if (name === "password" && value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                setFieldErrors((prev) => ({ ...prev, password: validation.message }));
            }
        }
        if (name === "confirmedPassword" && value) {
            const validation = validateConfirmedPassword(formData.password, value);
            if (!validation.isValid) {
                setFieldErrors((prev) => ({ ...prev, confirmedPassword: validation.message }));
            }
        }
        if (name === "phone" && value) {
            const isValid = validatePhone(value);
            if (!isValid) {
                setFieldErrors((prev) => ({ ...prev, phone: "Số điện thoại không hợp lệ." }));
            }
        }
        if (name === "gender" && value) {
            const isValid = validateGender(value);
            if (!isValid) {
                setFieldErrors((prev) => ({ ...prev, gender: "Vui lòng chọn giới tính hợp lệ." }));
            }
        }
    };

    const capitalizeName = (name) => {
        return name
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handlePhoneInput = (e) => {
        const value = e.target.value;
        // Allow only digits
        if (!/^\d*$/.test(value)) {
            e.target.value = value.replace(/\D/g, "");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFieldErrors({
            username: "",
            email: "",
            password: "",
            confirmedPassword: "",
            phone: "",
            gender: "",
        });

        // Check for empty required fields
        const newFieldErrors = {
            username: !formData.username ? "Không được để trống!" : "",
            email: !formData.email ? "Không được để trống!" : "",
            password: !formData.password ? "Không được để trống!" : "",
            confirmedPassword: !formData.confirmedPassword ? "Không được để trống!" : "",
            gender: !formData.gender ? "Không được để trống!" : "",
            phone: "",
        };
        const hasEmptyFields = Object.values(newFieldErrors).some((error) => error);
        if (hasEmptyFields) {
            toast.error("Hãy sửa tất cả các lỗi trước khi tạo tài khoản");
            setFieldErrors(newFieldErrors);
            return;
        }

        // Validate fields
        const usernameValid = validateUsername(formData.username);
        const emailValid = validateEmail(formData.email);
        const passwordValidation = validatePassword(formData.password);
        const confirmedPasswordValidation = validateConfirmedPassword(formData.password, formData.confirmedPassword);
        const phoneValid = formData.phone ? validatePhone(formData.phone) : true;
        const genderValid = validateGender(formData.gender);

        if (!usernameValid) {
            newFieldErrors.username = "Tên chỉ được chứa chữ cái và dấu cách.";
        }
        if (!emailValid) {
            newFieldErrors.email = "Vui lòng nhập email hợp lệ.";
        }
        if (!passwordValidation.isValid) {
            newFieldErrors.password = passwordValidation.message;
        }
        if (!confirmedPasswordValidation.isValid) {
            newFieldErrors.confirmedPassword = confirmedPasswordValidation.message;
        }
        if (!phoneValid) {
            newFieldErrors.phone = "Số điện thoại không hợp lệ.";
        }
        if (!genderValid) {
            newFieldErrors.gender = "Vui lòng chọn giới tính hợp lệ.";
        }

        const hasValidationErrors = Object.values(newFieldErrors).some((error) => error);
        if (hasValidationErrors) {
            toast.error("Hãy sửa tất cả các lỗi trước khi tạo tài khoản");
            setFieldErrors(newFieldErrors);
            return;
        }

        // Chuẩn hóa tên trước khi gửi
        const capitalizedUsername = capitalizeName(formData.username);

        // Set localStorage and navigate immediately
        localStorage.setItem("unverifiedEmail", formData.email);
        localStorage.setItem("verifySource", "register");
        onRegistering(formData.email);
        navigate("/verify");

        // Send registration request asynchronously in the background
        fetch(`${import.meta.env.VITE_BE_URL}/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: capitalizedUsername,
                email: formData.email,
                password: formData.confirmedPassword,
                phone: formData.phone,
                gender: formData.gender,
            }),
        })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) {
                    // If registration fails, navigate back and show error
                    navigate("/register");
                    setFormError(result.message || "Đăng ký thất bại.");
                    toast.error(result.message || "Đăng ký thất bại.");
                    localStorage.removeItem("unverifiedEmail");
                    localStorage.removeItem("verifySource");
                }
            })
            .catch((err) => {
                // Handle network or other errors
                navigate("/register");
                setFormError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
                toast.error(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
                localStorage.removeItem("unverifiedEmail");
                localStorage.removeItem("verifySource");
            });
    };

    return (
        <Container className="justify-content-center">
            <Row>
                <Col md={12}>
                    <h3 className="text-center mb-3">Đăng ký tài khoản</h3>

                    {formError && <Alert variant="danger">{formError}</Alert>}

                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-2" controlId="username">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Họ và tên"
                                value={formData.username}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.username}
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.username}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="example@domain.com"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="password">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.password}
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="confirmedPassword">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmedPassword"
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmedPassword}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.confirmedPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fieldErrors.confirmedPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="phone">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                onInput={handlePhoneInput}
                                inputMode="numeric"
                                isInvalid={!!fieldErrors.phone}
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="gender">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                isInvalid={!!fieldErrors.gender}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{fieldErrors.gender}</Form.Control.Feedback>
                        </Form.Group>
                        <div className="text-center">
                            <Button
                                type="submit"
                                className="cs_btn cs_style_1 cs_color_1"
                                style={{ border: "none", outline: "none" }}
                            >
                                Tạo Tài Khoản
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
