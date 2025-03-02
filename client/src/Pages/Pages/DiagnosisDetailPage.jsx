import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const DiagnosisDetailPage = () => {
  const { id } = useParams();
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    if (id) {
      const storedDiagnoses = JSON.parse(localStorage.getItem("diagnoses")) || [];
      const foundDiagnosis = storedDiagnoses.find((diag) => diag.id === parseInt(id));
      setDiagnosis(foundDiagnosis);
    }
  }, [id]);

  if (!diagnosis) {
    return <div>No diagnosis found!</div>;
  }

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={{ title: "Diagnosis Details" }} />
      </Section>

      <Section className="cs_diagnosis">
        <div className="container">
          <div className="cs_diagnosis_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle="VIEW DIAGNOSIS" SectionTitle="Diagnosis Details" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px" }}>
              <div className="row">
                {/* Patient Information */}
                <div className="col-md-6"><strong>Patient Name:</strong> <p>{diagnosis.patientName}</p></div>
                <div className="col-md-6"><strong>Patient ID:</strong> <p>{diagnosis.patientId}</p></div>
                <div className="col-md-6"><strong>Gender:</strong> <p>{diagnosis.gender}</p></div>
                <div className="col-md-6"><strong>Date of Birth:</strong> <p>{diagnosis.birthDate}</p></div>
                <div className="col-md-6"><strong>Phone Number:</strong> <p>{diagnosis.phone}</p></div>
                <div className="col-md-12"><strong>Address:</strong> <p>{diagnosis.address}</p></div>

                {/* Symptoms */}
                <div className="col-md-12"><strong>Symptoms:</strong> <p>{diagnosis.symptoms}</p></div>
                <div className="col-md-6"><strong>Start Time of Symptoms:</strong> <p>{diagnosis.symptomStartTime}</p></div>
                <div className="col-md-6"><strong>Severity of Symptoms:</strong> <p>{diagnosis.symptomSeverity}</p></div>

                {/* Medical History */}
                <div className="col-md-12"><strong>Personal Medical History:</strong> <p>{diagnosis.personalHistory}</p></div>
                <div className="col-md-12"><strong>Past Surgeries:</strong> <p>{diagnosis.surgeries}</p></div>
                <div className="col-md-12"><strong>Allergies:</strong> <p>{diagnosis.allergies}</p></div>

                {/* Clinical Examination */}
                <div className="col-md-12"><strong>Clinical Examination:</strong> <p>{diagnosis.clinicalExamination}</p></div>
                <div className="col-md-12"><strong>Lab Tests:</strong> <p>{diagnosis.labTests}</p></div>

                {/* Diagnosis */}
                <div className="col-md-12"><strong>Preliminary Diagnosis:</strong> <p>{diagnosis.diagnosisPreliminary}</p></div>
                <div className="col-md-12"><strong>Final Diagnosis:</strong> <p>{diagnosis.diagnosisFinal}</p></div>
                <div className="col-md-6"><strong>ICD Code:</strong> <p>{diagnosis.icdCode}</p></div>

                {/* Treatment Plan */}
                <div className="col-md-12"><strong>Treatment Plan:</strong> <p>{diagnosis.treatmentPlan}</p></div>
                <div className="col-md-12"><strong>Medical Interventions:</strong> <p>{diagnosis.medicalInterventions}</p></div>
                <div className="col-md-12"><strong>Lifestyle Changes:</strong> <p>{diagnosis.lifestyleChanges}</p></div>
                <div className="col-md-12"><strong>Follow-up Plan:</strong> <p>{diagnosis.followUpPlan}</p></div>

                {/* Doctor's Notes */}
                <div className="col-md-12"><strong>Doctor's Notes:</strong> <p>{diagnosis.doctorNotes}</p></div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default DiagnosisDetailPage;
