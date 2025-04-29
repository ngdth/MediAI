import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ResetPassForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmedPassword: "",
  });
  const [resendTimer, setResendTimer] = useState(60);
  const resetEmail = localStorage.getItem("resetEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Reset lỗi khi user nhập lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmedPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://amma-care.com/user/forgotPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            code: formData.otp,
            newPassword: formData.password,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem("resetEmail");
        navigate("/login");
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError("Sending new OTP...");
    try {
      const response = await fetch("https://amma-care.com/user/sendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setError("OTP resent to your email!");
        setResendTimer(60);
      } else {
        setError(`${data.message}`);
      }
    } catch {
      setError("Failed to resend OTP. Try again later.");
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={12}>
          <h3 className="text-center mb-3">Đặt lại mật khẩu</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <p className="text-muted">
              Chúng tôi đã gửi OTP đến:{" "}
              <strong>{resetEmail || "your email"}</strong>. Vui lòng kiểm tra
              email để tiếp tục.
            </p>

            {/* OTP nhập và nút gửi lại */}
            <Form.Group className="mb-3">
              <Form.Label className="mb-1">Nhập OTP</Form.Label>
              <Form.Control
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Nhập OTP"
                required
              />
            </Form.Group>

            {/* Mật khẩu mới */}
            <Form.Group className="mb-3">
              <Form.Label className="mb-1">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Nhập mật khẩu mới của bạn"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Xác nhận mật khẩu */}
            <Form.Group className="mb-3">
              <Form.Label className="mb-1">
                Xác nhận mật khẩu của bạn
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmedPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmedPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              className="w-100 mb-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Đặt lại mật khẩu"}
            </Button>
            <Button
              variant="link"
              className="w-100 fw-bold"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0
                ? `Gửi lại OTP sau ${resendTimer}s`
                : "Gửi lại OTP"}
            </Button>
          </Form>

          <div className="text-center mt-2 text-muted">
            <Link to="/login">Trở về đăng nhập</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassForm;
