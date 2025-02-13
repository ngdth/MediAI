import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import RegisterForm from "../../components/Form/RegisterForm";

function RegisterPage() {

    const handleRegistering = () => {
        console.log("Email registering attempt:", localStorage.getItem("unverifiedEmail"));
    };

    return (
        <Container className="d-flex align-items-center justify-content-center bg-white p-3" 
        // style={{
        //     backgroundImage: "url('/images/background.jpg')",
        //     backgroundSize: "cover",
        //     backgroundPosition: "center",
        //     minHeight: "100vh",
        // }}
        >
        <Row className="w-100 justify-content-center my-5">
            <Col md={4}>
                <Card className="shadow-sm p-4">
                    <Card.Body>
                        <RegisterForm onRegistering={handleRegistering}/>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
    );
}

export default RegisterPage;