import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const VerifyForm = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // 60 giây chờ để gửi lại OTP
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

    const handleVerify = async () => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail, code: otp }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Email verified successfully!");
                localStorage.removeItem("unverifiedEmail");
                navigate("/login");
            } else {
                setMessage(`${data.message || "Invalid OTP"}`);
            }
        } catch (error) {
            setMessage("Network error. Try again later.");
        }

        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setMessage("Sending new OTP...");
        try {
            const response = await fetch(`${import.meta.env.VITE_BE_URL}/user/sendotp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("OTP resent to your email!");
                setResendTimer(60); // Đặt lại bộ đếm 60 giây
            } else {
                setMessage(`${data.message}`);
            }
        } catch {
            setMessage("Failed to resend OTP. Try again later.");
        }
    };

    return (
        <>
            <p className="text-muted">
                Bạn đã nhập <strong>{unverifiedEmail || "your email"}</strong> để làm email cho tài khoản của bạn. Vui lòng kiểm tra email của bạn!
            </p>
            {message && <Alert variant="danger">{message}</Alert>}
            <Form>
                <Form.Group className="mb-3 d-flex align-items-center">
                    <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã OTP"
                        className="text-center flex-grow-1"
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
