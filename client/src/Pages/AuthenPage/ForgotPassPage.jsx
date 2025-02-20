import React, { useState } from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import ForgotPassForm from "../../components/Form/ForgotPassForm";

function ForgotPassPage() {

    return (
        <Container fluid className="my-5">
            <Row className="align-items-center d-flex justify-content-around">
                <Col md={4}>
                    <Card className="shadow-lg" style={{ backgroundColor: "#F6F8FA", borderRadius: "10px" }}>
                        <Card.Body>
                            <ForgotPassForm />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5} className="text-center">
                    <Image
                        src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1123.jpg?t=st=1739558170~exp=1739561770~hmac=f237ea381bfdfe9df6b81ba69860a59e1ac40dcc98b4b9f3bc0b8cc3c9c01830&w=826"
                        fluid
                        alt="Login Image"
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default ForgotPassPage;
