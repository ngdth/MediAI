import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const VerifyForm = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Email verified successfully!");
      } else {
        setMessage(`❌ ${data.message || "Invalid OTP"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Try again later.");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setMessage("🔄 Sending new OTP...");
    try {
      const response = await fetch("http://localhost:8080/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setMessage(response.ok ? "✅ OTP resent to your email!" : `❌ ${data.message}`);
    } catch {
      setMessage("❌ Failed to resend OTP. Try again later.");
    }
  };

  return (
    <>
      <p className="text-muted">
        You've entered <strong>your-email@example.com</strong> as the email for your account.
        Please enter the OTP below.
      </p>
      {message && <Alert variant="info">{message}</Alert>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="text-center"
          />
        </Form.Group>
        <Button variant="primary" className="w-100 mb-2" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify your email"}
        </Button>
        <Button variant="link" className="text-decoration-none" onClick={handleResendOTP}>
          Re-send OTP
        </Button>
      </Form>
    </>
  );
};

export default VerifyForm;
