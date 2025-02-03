import React, { useState } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import LoginForm from "../../components/Form/LoginForm";

function LoginPage() {
    const [data, setData] = useState(null);

    const handleLogin = (data) => {
        setData(data);
        console.log("Login attempt:", data);
    };

    return (
        <Container fluid className="p-3 my-5">
            <Row className="align-items-center">
                <Col md={6} className="text-center">
                    <Image
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                        fluid
                        alt="Login Illustration"
                    />
                </Col>
                <Col md={6}>
                    <LoginForm onLogin={handleLogin} />
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;