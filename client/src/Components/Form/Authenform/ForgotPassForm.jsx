import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassForm = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Xóa lỗi cũ trước khi gửi
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/user/sendotp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem("resetEmail", email);
                navigate("/resetPass");
            } else {
                setError(result.message || "Sending reset OTP failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
        setLoading(false);
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={12}>
                    <h3 className="text-center mb-3">Quên mật khẩu</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicEmail" className="pb-3">
                            <Form.Label>
                            Vui lòng nhập địa chỉ email bạn muốn đặt lại mật khẩu 
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-4 mb-3"
                            />
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
