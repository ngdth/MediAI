import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassForm = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            setMessage("A password reset link has been sent to your email.");
            setTimeout(() => navigate("/login"), 3000);
        } else {
            setMessage("Please enter a valid email address.");
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={12}>
                    <div className="p-4 rounded shadow bg-white">
                        <h2 className="text-center mb-3">Forgot Password</h2>
                        {message && <Alert variant="info">{message}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 mt-3">
                                Request Reset Link
                            </Button>
                        </Form>
                        <div className="text-center mt-3">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassForm;
