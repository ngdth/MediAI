import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import VerifyForm from "../../Components/Form/Authenform/VerifyForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VerifyPage() {
    const navigate = useNavigate();

    const handleChangeEmail = async () => {
        const unverifiedEmail = localStorage.getItem("unverifiedEmail");

        try {
            await fetch("http://localhost:8080/user/deleteUnverified", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: unverifiedEmail }),
            });

            localStorage.removeItem("unverifiedEmail");
            navigate("/register");
        } catch (error) {
            toast.error("Không thể xóa email chưa xác thực: " + error.message);
        }
    };

    // Callback to display toast messages from VerifyForm
    const showToast = (message, type = "error") => {
        if (type === "error") {
            toast.error(message);
        } else {
            toast.success(message);
        }
    };

    return (
        <>
            <Container className="d-flex align-items-center justify-content-center min-vh-100 pt-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow-lg text-center p-5" style={{ backgroundColor: "#F6F8FA", borderRadius: "10px" }}>
                            <Card.Body>
                                <img
                                    src="../assets/img/letter.png"
                                    alt="Email Verification"
                                    className="w-25 mx-auto mb-3"
                                />
                                <h2 className="mb-4" style={{ fontSize: "38px" }}>Xác thực tài khoản</h2>
                                <VerifyForm showToast={showToast} />
                                <span
                                    onClick={handleChangeEmail}
                                    className="text-muted small cursor-pointer"
                                    style={{ textDecoration: "none", cursor: "pointer" }}
                                    onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                                    onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                                >
                                    Dùng email khác?
                                </span>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default VerifyPage;