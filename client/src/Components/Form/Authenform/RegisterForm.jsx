import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = ({ onRegistering }) => {
    //"/verify-otp"
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmedPassword: "" });
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
            const response = await fetch("http://localhost:8080/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.confirmedPassword,
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
                    <h3 className="text-center mb-5">Register</h3>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Control
                                type="username"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Control
                                type="password"
                                name="confirmedPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmedPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <p className="text-muted text-center" style={{ fontSize: "12px" }}>
                            By creating an account, you agree to the <br />
                            <Link to="/*" className="text-decoration-underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link to="/*" className="text-decoration-underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>

                        <div className="text-center">
                            <Button
                                type="submit"
                                className="cs_btn cs_style_1 cs_color_1"
                                style={{ border: "none", outline: "none" }}
                                disabled={loading}
                            >
                                {loading ? "Sending OPT..." : "Create new account"}
                            </Button>
                        </div>

                        <p className="text-muted text-center mt-4 small">
                            Have an account?{" "}
                            <Link className="text-decoration-underline text-primary " to="/login">
                                Log In
                            </Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterForm;
