import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = ({ onRegistering }) => {
    //"/verify-otp"
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmedPassword: "", phone: "", gender:""});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        setError("");
        if (formData.password !== formData.confirmedPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {


            if (!formData.gender) {
                setError("Vui lòng chọn giới tính.");
                setLoading(false);
                return;
            }
            const response = await fetch("https://amma-care.com/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
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
                setError(result.message || "Registration failed");
            }
        } catch (err) {
            // setError("An error occurred. Please try again.");
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <Container className="justify-content-center">
            <Row>
                <Col md={12}>
                    <h3 className="text-center mb-3">Đăng ký tài khoản</h3>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="username"
                                name="username"
                                placeholder="Họ và tên"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
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
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                placeholder="Số điện thọai"
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="^(\+84|0)(3|5|7|8|9)[0-9]{8}$"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
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
                                {loading ? "Đang Gửi Mã OPT..." : "Tạo Tài Khoản"}
                            </Button>
                        </div>

                        <p className="text-muted text-center mt-2 small">
                            Đã có tài khoản?{" "}
                            <Link className="text-decoration-underline text-primary " to="/login">
                                Đăng nhập
                            </Link>{" "}
                            |{" "}
                            <Link className="text-decoration-underline text-primary " to="/">
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
