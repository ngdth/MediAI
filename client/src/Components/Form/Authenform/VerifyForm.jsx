import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const VerifyForm = ({ showToast }) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // 60 giây chờ để gửi lại OTP
    const [showValidationError, setShowValidationError] = useState(false); // State to control when to show validation error
    const unverifiedEmail = localStorage.getItem("unverifiedEmail");

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleOtpInput = (e) => {
        const value = e.target.value;
        // Allow only 6 digits
        if (!/^\d{0,6}$/.test(value)) {
            e.target.value = value.replace(/\D/g, "").slice(0, 6);
        }
        setOtp(e.target.value);
        setShowValidationError(false); // Reset validation visibility when input changes
    };

    const handleVerify = async () => {
        setLoading(true);
        setShowValidationError(true); // Show validation error after clicking "Xác thực email"

        if (!/^\d{6}$/.test(otp)) {
            showToast("Sửa tất cả lỗi trước khi xác thực. OTP phải là 6 chữ số", "error");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail, code: otp }),
            });

            const data = await response.json();
            if (response.ok) {
                showToast("Tài khoản đã xác thực thành công", "success");
                localStorage.removeItem("unverifiedEmail");
                localStorage.removeItem("verifySource");
                navigate("/login");
            } else {
                showToast(data.message || "OTP không hợp lệ", "error");
            }
        } catch (error) {
            showToast("Đã có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }

        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/sendotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail }),
            });

            const data = await response.json();
            if (response.ok) {
                showToast("OTP đã được gửi về email của bạn!", "success");
                setResendTimer(60); // Đặt lại bộ đếm 60 giây
            } else {
                showToast(data.message, "error");
            }
        } catch {
            showToast("Lỗi khi gửi OTP. Hãy thử lại!", "error");
        }
    };

    return (
        <>
            <p className="text-muted">
                Bạn đã nhập <strong>{unverifiedEmail || "your email"}</strong> để làm email cho tài khoản của bạn. Vui lòng kiểm tra email của bạn!
            </p>
            <Form>
                <Form.Group className="mb-3 d-flex align-items-center">
                    <Form.Control
                        type="text"
                        value={otp}
                        onChange={handleOtpInput}
                        placeholder="Nhập mã OTP"
                        className="text-center flex-grow-1"
                        maxLength="6"
                        pattern="[0-9]*"
                        isInvalid={showValidationError && !/^\d{6}$/.test(otp)}
                    />
                    <Button variant="link" className="ms-2" onClick={handleResendOTP} disabled={resendTimer > 0}>
                        {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : "Gửi lại mã OTP"}
                    </Button>
                </Form.Group>

                <Button variant="primary" className="w-100 mb-2" onClick={handleVerify} disabled={loading}>
                    {loading ? "Đang xác thực" : "Xác thực email"}
                </Button>
            </Form>
        </>
    );
};

export default VerifyForm;
