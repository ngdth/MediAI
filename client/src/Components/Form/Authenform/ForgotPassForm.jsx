import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { validateEmail } from "../../../utils/validateUtils";

const ForgotPassForm = () => {
    const [email, setEmail] = useState("");
    const [fieldErrors, setFieldErrors] = useState({ email: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setFieldErrors({ email: "" });

        // Real-time validation
        if (value) {
            const isValid = validateEmail(value);
            if (!isValid) {
                setFieldErrors({ email: "Vui lòng nhập email hợp lệ." });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({ email: "" }); // Xóa lỗi cũ trước khi gửi
        setLoading(true);

        // Check for empty required fields
        const newFieldErrors = {
            email: !email ? "Không được để trống!" : "",
        };
        if (newFieldErrors.email) {
            toast.error("Hãy sửa tất cả các lỗi trước khi gửi");
            setFieldErrors(newFieldErrors);
            setLoading(false);
            return;
        }

        // Validate email
        const isEmailValid = validateEmail(email);
        if (!isEmailValid) {
            newFieldErrors.email = "Vui lòng nhập email hợp lệ.";
            toast.error("Hãy sửa tất cả các lỗi trước khi gửi");
            setFieldErrors(newFieldErrors);
            setLoading(false);
            return;
        }

        navigate("/resetpass");
        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/sendotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success("OTP đã được gửi đến email của bạn!");
                localStorage.setItem("resetEmail", email);
            } else {
                toast.error(result.message || "Gửi OTP thất bại");
            }
        } catch (err) {
           toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
        setLoading(false);
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={12}>
                    <h3 className="text-center mb-3">Quên mật khẩu</h3>
                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group controlId="formBasicEmail" className="pb-3">
                            <Form.Label>
                                Vui lòng nhập địa chỉ email bạn muốn đặt lại mật khẩu 
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={handleChange}
                                required
                                className="mt-4 mb-3"
                                isInvalid={!!fieldErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" className="w-100 mb-2" type="submit" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </Button>
                    </Form>
                    <div className="text-center mt-3 text-muted">
                        Trở Về
                        <Link to="/login"> Trang Đăng Nhập</Link>{" "}
                        |{" "}
                        <Link to="/">Trang Chủ</Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassForm;
