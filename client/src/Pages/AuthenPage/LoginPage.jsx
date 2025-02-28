import React, { useState } from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import LoginForm from "../../components/Form/LoginForm";

function LoginPage() {
    const [data, setData] = useState(null);

    const handleLogin = (data) => {
        setData(data);
        console.log("Login attempt: ");
    };

    return (
        <Container fluid className="my-5">
            <Row className="align-items-center d-flex justify-content-around">
                <Col md={5} className="text-center">
                    <Image
                        src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?t=st=1739558694~exp=1739562294~hmac=ad833175f19c3498cd08dab1ce842a7e44c1a8dcb9c6dab188f191579bc76221&w=826"
                        fluid
                        alt="Login Image"
                    />
                </Col>
                <Col md={4}>
                    <Card className="shadow-lg p-5" style={{ backgroundColor: "#F6F8FA", borderRadius: "10px"}}>
                        <Card.Body>
                            <LoginForm onLogin={handleLogin} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;
