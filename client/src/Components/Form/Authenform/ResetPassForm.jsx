import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { validateOTP, validatePassword, validateConfirmedPassword } from "../../../utils/validateUtils";

const ResetPassForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmedPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: "" })); // Reset lỗi khi user nhập lại

    // Real-time validation
    if (name === "otp" && value) {
      const validation = validateOTP(value);
      if (!validation.isValid) {
        setFieldErrors((prev) => ({ ...prev, otp: validation.message }));
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
  };

  const handleOtpInput = (e) => {
    const value = e.target.value;
    // Allow only 6 digits
    if (!/^\d{0,6}$/.test(value)) {
      e.target.value = value.replace(/\D/g, "").slice(0, 6);
    }
    setFormData({ ...formData, otp: e.target.value });
    setFieldErrors((prev) => ({ ...prev, otp: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({
      otp: "",
      password: "",
      confirmedPassword: "",
    });
    setLoading(true);

    // Check for empty required fields
    const newFieldErrors = {
      otp: !formData.otp ? "Không được để trống!" : "",
      password: !formData.password ? "Không được để trống!" : "",
      confirmedPassword: !formData.confirmedPassword ? "Không được để trống!" : "",
    };
    const hasEmptyFields = Object.values(newFieldErrors).some((error) => error);
    if (hasEmptyFields) {
      toast.error("Hãy sửa tất cả các lỗi trước khi đặt lại mật khẩu");
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    // Validate fields
    const otpValidation = validateOTP(formData.otp);
    const passwordValidation = validatePassword(formData.password);
    const confirmedPasswordValidation = validateConfirmedPassword(formData.password, formData.confirmedPassword);

    if (!otpValidation.isValid) {
      newFieldErrors.otp = otpValidation.message;
    }
    if (!passwordValidation.isValid) {
      newFieldErrors.password = passwordValidation.message;
    }
    if (!confirmedPasswordValidation.isValid) {
      newFieldErrors.confirmedPassword = confirmedPasswordValidation.message;
    }

    const hasValidationErrors = Object.values(newFieldErrors).some((error) => error);
    if (hasValidationErrors) {
      toast.error("Hãy sửa tất cả các lỗi trước khi đặt lại mật khẩu");
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_URL}/user/forgotPassword`,
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
        toast.success("Mật khẩu đã được đặt lại thành công!");
        localStorage.removeItem("resetEmail");
        navigate("/login");
      } else {
        toast.error(result.message || "Không thể đặt lại mật khẩu");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    toast.info("Đang gửi OTP mới...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("OTP đã được gửi lại đến email của bạn!");
        setResendTimer(60);
      } else {
        toast.error(`${data.message}`);
      }
    } catch {
      toast.error("Không thể gửi lại OTP. Vui lòng thử lại sau.");
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={12}>
          <h3 className="text-center mb-3">Đặt lại mật khẩu</h3>
          <Form onSubmit={handleSubmit} noValidate>
            <p className="text-muted">
              Chúng tôi đã gửi OTP đến:{" "}
              <strong>{resetEmail || "your email"}</strong>. Vui lòng kiểm tra
              email để tiếp tục.
            </p>

            {/* OTP nhập và nút gửi lại */}
            <Form.Group className="mb-3" controlId="otp">
              <Form.Label className="mb-1">Nhập OTP</Form.Label>
              <Form.Control
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                onInput={handleOtpInput}
                placeholder="Nhập OTP"
                required
                isInvalid={!!fieldErrors.otp}
                maxLength="6"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.otp}</Form.Control.Feedback>
            </Form.Group>

            {/* Mật khẩu mới */}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="mb-1">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Nhập mật khẩu mới của bạn"
                value={formData.password}
                onChange={handleChange}
                required
                isInvalid={!!fieldErrors.password}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
            </Form.Group>

            {/* Xác nhận mật khẩu */}
            <Form.Group className="mb-3" controlId="confirmedPassword">
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
                isInvalid={!!fieldErrors.confirmedPassword}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.confirmedPassword}</Form.Control.Feedback>
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