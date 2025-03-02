import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const UpdateDiagnosisPage = () => {
  const navigate = useNavigate();
  const { diagnosisId } = useParams();  // Lấy diagnosisId từ URL
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    address: "",
    phone: "",
    patientId: "",
    symptoms: "",
    symptomStartTime: "",
    symptomSeverity: "",
    personalHistory: "",
    surgeries: "",
    allergies: "",
    clinicalExamination: "",
    labTests: "",
    diagnosisPreliminary: "",
    diagnosisFinal: "",
    icdCode: "",
    treatmentPlan: "",
    medicalInterventions: "",
    lifestyleChanges: "",
    followUpPlan: "",
    doctorNotes: "",
  });

  // Nếu là trang sửa, load dữ liệu diagnosis cũ
  useEffect(() => {
    if (diagnosisId) {
      const storedDiagnoses = JSON.parse(localStorage.getItem("diagnoses")) || [];
      const diagnosisToEdit = storedDiagnoses.find((diagnosis) => diagnosis.id === parseInt(diagnosisId));
      if (diagnosisToEdit) {
        setFormData(diagnosisToEdit);
      }
    }
  }, [diagnosisId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the diagnoses from localStorage
    const storedDiagnoses = JSON.parse(localStorage.getItem("diagnoses")) || [];
    
    if (diagnosisId) {
      // Nếu là cập nhật diagnosis
      const updatedDiagnoses = storedDiagnoses.map((diagnosis) =>
        diagnosis.id === parseInt(diagnosisId) ? { ...diagnosis, ...formData } : diagnosis
      );
      localStorage.setItem("diagnoses", JSON.stringify(updatedDiagnoses));
      alert("Diagnosis updated successfully!");
    }

    navigate("/diagnosismanagement");  // Redirect to the management page
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={{ title: "Update Diagnosis" }} />
      </Section>

      <Section className="cs_diagnosis">
        <div className="container">
          <div className="cs_diagnosis_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto 0 auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle="UPDATE DIAGNOSIS" SectionTitle="Update Diagnosis Form" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px", position: "relative", marginBottom: "20px" }}>
              <form className="cs_diagnosis_form row cs_gap_y_30" onSubmit={handleSubmit} style={{ margin: 0 }}>
                {/* Patient Name */}
                <div className="col-md-6">
                  <label className="cs_form_label">Patient Name</label>
                  <input type="text" className="cs_form_field" name="name" value={formData.name} onChange={handleInputChange} />
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <label className="cs_form_label">Gender</label>
                  <select className="cs_form_field" name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="col-md-6">
                  <label className="cs_form_label">Date of Birth</label>
                  <input type="date" className="cs_form_field" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                </div>

                {/* Address */}
                <div className="col-md-6">
                  <label className="cs_form_label">Address</label>
                  <input type="text" className="cs_form_field" name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                {/* Phone Number */}
                <div className="col-md-6">
                  <label className="cs_form_label">Phone Number</label>
                  <input type="text" className="cs_form_field" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>

                {/* Patient ID */}
                <div className="col-md-6">
                  <label className="cs_form_label">Patient ID (if any)</label>
                  <input type="text" className="cs_form_field" name="patientId" value={formData.patientId} onChange={handleInputChange} />
                </div>

                {/* Symptoms */}
                <div className="col-md-12">
                  <label className="cs_form_label">Symptoms</label>
                  <textarea className="cs_form_field" name="symptoms" value={formData.symptoms} onChange={handleInputChange}></textarea>
                </div>

                {/* Symptom Start Time */}
                <div className="col-md-6">
                  <label className="cs_form_label">Start Time of Symptoms</label>
                  <input type="date" className="cs_form_field" name="symptomStartTime" value={formData.symptomStartTime} onChange={handleInputChange} />
                </div>

                {/* Symptom Severity */}
                <div className="col-md-6">
                  <label className="cs_form_label">Severity of Symptoms</label>
                  <select className="cs_form_field" name="symptomSeverity" value={formData.symptomSeverity} onChange={handleInputChange}>
                    <option value="">Select Severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                {/* Personal Medical History */}
                <div className="col-md-12">
                  <label className="cs_form_label">Personal Medical History</label>
                  <textarea className="cs_form_field" name="personalHistory" value={formData.personalHistory} onChange={handleInputChange}></textarea>
                </div>

                {/* Past Surgeries */}
                <div className="col-md-12">
                  <label className="cs_form_label">Past Surgeries</label>
                  <textarea className="cs_form_field" name="surgeries" value={formData.surgeries} onChange={handleInputChange}></textarea>
                </div>

                {/* Allergies */}
                <div className="col-md-12">
                  <label className="cs_form_label">Allergies</label>
                  <textarea className="cs_form_field" name="allergies" value={formData.allergies} onChange={handleInputChange}></textarea>
                </div>

                {/* Clinical Examination */}
                <div className="col-md-12">
                  <label className="cs_form_label">Clinical Examination</label>
                  <textarea className="cs_form_field" name="clinicalExamination" value={formData.clinicalExamination} onChange={handleInputChange}></textarea>
                </div>

                {/* Lab Tests */}
                <div className="col-md-12">
                  <label className="cs_form_label">Lab Tests</label>
                  <textarea className="cs_form_field" name="labTests" value={formData.labTests} onChange={handleInputChange}></textarea>
                </div>

                {/* Preliminary Diagnosis */}
                <div className="col-md-12">
                  <label className="cs_form_label">Preliminary Diagnosis</label>
                  <textarea className="cs_form_field" name="diagnosisPreliminary" value={formData.diagnosisPreliminary} onChange={handleInputChange}></textarea>
                </div>

                {/* Final Diagnosis */}
                <div className="col-md-12">
                  <label className="cs_form_label">Final Diagnosis</label>
                  <textarea className="cs_form_field" name="diagnosisFinal" value={formData.diagnosisFinal} onChange={handleInputChange}></textarea>
                </div>

                {/* ICD Code */}
                <div className="col-md-6">
                  <label className="cs_form_label">ICD Code (if needed)</label>
                  <input type="text" className="cs_form_field" name="icdCode" value={formData.icdCode} onChange={handleInputChange} />
                </div>

                {/* Treatment Plan */}
                <div className="col-md-12">
                  <label className="cs_form_label">Treatment Plan</label>
                  <textarea className="cs_form_field" name="treatmentPlan" value={formData.treatmentPlan} onChange={handleInputChange}></textarea>
                </div>

                {/* Medical Interventions */}
                <div className="col-md-12">
                  <label className="cs_form_label">Medical Interventions</label>
                  <textarea className="cs_form_field" name="medicalInterventions" value={formData.medicalInterventions} onChange={handleInputChange}></textarea>
                </div>

                {/* Lifestyle Changes */}
                <div className="col-md-12">
                  <label className="cs_form_label">Lifestyle Changes</label>
                  <textarea className="cs_form_field" name="lifestyleChanges" value={formData.lifestyleChanges} onChange={handleInputChange}></textarea>
                </div>

                {/* Follow-up Plan */}
                <div className="col-md-12">
                  <label className="cs_form_label">Follow-up Plan</label>
                  <textarea className="cs_form_field" name="followUpPlan" value={formData.followUpPlan} onChange={handleInputChange}></textarea>
                </div>

                {/* Doctor's Notes */}
                <div className="col-md-12">
                  <label className="cs_form_label">Doctor's Notes</label>
                  <textarea className="cs_form_field" name="doctorNotes" value={formData.doctorNotes} onChange={handleInputChange}></textarea>
                </div>

                {/* Submit Button */}
                <div className="col-md-12 text-center mt-4">
                  <button type="submit" className="cs_btn cs_style_1 cs_white_color" style={{ backgroundColor: "#007bff", borderColor: "#007bff", padding: "10px 30px", borderRadius: "25px" }}>
                    Update Diagnosis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default UpdateDiagnosisPage;
