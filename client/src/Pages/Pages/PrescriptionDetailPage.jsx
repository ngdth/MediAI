import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const PrescriptionDetailPage = () => {
  const { id } = useParams();  // Get id from URL
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    if (id) {
      // Retrieve prescriptions from localStorage and find the one by id
      const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
      const foundPrescription = storedPrescriptions.find(prescription => prescription.id === parseInt(id));
      setPrescription(foundPrescription);
    }
  }, [id]);

  if (!prescription) {
    return <div>No prescription found!</div>;  // Show message if no prescription is found
  }

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={{ title: "Prescription Details" }} />
      </Section>

      <Section className="cs_prescription">
        <div className="container">
          <div className="cs_prescription_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto 0 auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle="VIEW PRESCRIPTION" SectionTitle="Prescription Details" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px", position: "relative", marginBottom: "20px" }}>
              <div className="row">
                <div className="col-md-6"><strong>Patient Name:</strong><p>{prescription.patientName}</p></div>
                <div className="col-md-6"><strong>Patient ID:</strong><p>{prescription.patientId}</p></div>
                <div className="col-md-6"><strong>Gender:</strong><p>{prescription.gender}</p></div>
                <div className="col-md-6"><strong>Date of Birth:</strong><p>{prescription.birthDate}</p></div>
                <div className="col-md-6"><strong>Phone Number:</strong><p>{prescription.phone}</p></div>
                <div className="col-md-6"><strong>Address:</strong><p>{prescription.address}</p></div>
                <div className="col-md-6"><strong>Doctor Name:</strong><p>{prescription.doctorName}</p></div>
                <div className="col-md-6"><strong>Doctor Specialty:</strong><p>{prescription.doctorSpecialty}</p></div>
                <div className="col-md-6"><strong>Doctor License:</strong><p>{prescription.doctorLicense}</p></div>
                <div className="col-md-12"><strong>Medicine Name:</strong><p>{prescription.medicineName}</p></div>
                <div className="col-md-6"><strong>Medicine Dosage:</strong><p>{prescription.medicineDosage}</p></div>
                <div className="col-md-6"><strong>Medicine Quantity:</strong><p>{prescription.medicineQuantity}</p></div>
                <div className="col-md-12"><strong>Usage Instructions:</strong><p>{prescription.usageInstructions}</p></div>
                <div className="col-md-6"><strong>Treatment Duration:</strong><p>{prescription.treatmentDuration}</p></div>
                <div className="col-md-12"><strong>Treatment Plan:</strong><p>{prescription.treatmentPlan}</p></div>
                <div className="col-md-12"><strong>Follow-up Instructions:</strong><p>{prescription.followUpInstructions}</p></div>
                <div className="col-md-12"><strong>Additional Notes:</strong><p>{prescription.additionalNotes}</p></div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default PrescriptionDetailPage;
