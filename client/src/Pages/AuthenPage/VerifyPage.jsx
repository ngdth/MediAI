import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import VerifyForm from "../../components/Form/VerifyForm";

function VerifyPage() {

    const handleVerifying = () => {
        console.log("Email verify attempt:", localStorage.getItem("unverifiedEmail"));
    };

    return (
        <Container className="d-flex align-items-center justify-content-center w-100 bg-primary">
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg text-center p-4">
              <Card.Body>
                <img
                  src="../assets/img/letter.png"
                  alt="Email Verification"
                  className="w-25 mx-auto mb-3"
                />
                <h2 className="mb-3">Verify your account</h2>
                <VerifyForm />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
}

export default VerifyPage;