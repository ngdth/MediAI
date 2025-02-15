import React from "react";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import RegisterForm from "../../components/Form/RegisterForm";

function RegisterPage() {
    const handleRegistering = () => {
        console.log("Email registering attempt:", localStorage.getItem("unverifiedEmail"));
    };

    return (
        <Container className="d-flex align-items-center justify-content-center bg-white p-3">
            <Row className="w-100 justify-content-around my-5">
                <Col md={6} className="text-center">
                    <Image
                        src="https://img.freepik.com/free-vector/placeholder-concept-illustration_114360-4983.jpg?t=st=1739595188~exp=1739598788~hmac=6acf584f97ec4cf4682ca4e0d670becdc203d172c9868f4255169efdacaa607f&w=826"
                        fluid
                        alt="Login Image"
                    />
                </Col>
                <Col md={4}>
                    <Card className="shadow-lg p-4" style={{ backgroundColor: "#F6F8FA", borderRadius: "10px" }}>
                        <Card.Body>
                            <RegisterForm onRegistering={handleRegistering} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterPage;
