import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import "react-datepicker/dist/react-datepicker.css";

const DiagnosisForm = () => {
  const headingData = { title: "Diagnosis Form" };
  const navigate = useNavigate();
  const location = useLocation();

  // Default form data
  const [formData, setFormData] = useState({
    patientName: "",
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

  // Kiểm tra nếu đang cập nhật chẩn đoán
  const isUpdate = location.state && location.state.diagnosis;

  // Nếu đang cập nhật, lấy dữ liệu cũ
  useEffect(() => {
    if (isUpdate) {
      setFormData(location.state.diagnosis);
    }
  }, [location.state, isUpdate]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const storedDiagnoses = JSON.parse(localStorage.getItem("diagnoses")) || [];

    if (isUpdate) {
      const updatedDiagnoses = storedDiagnoses.map((diagnosis) =>
        diagnosis.id === formData.id ? { ...diagnosis, ...formData } : diagnosis
      );
      localStorage.setItem("diagnoses", JSON.stringify(updatedDiagnoses));
      alert("Diagnosis updated successfully!");
    } else {
      const nextId = storedDiagnoses.length ? Math.max(...storedDiagnoses.map((d) => d.id)) + 1 : 1;
      const newDiagnosis = { ...formData, id: nextId };
      const updatedDiagnoses = [...storedDiagnoses, newDiagnosis];
      localStorage.setItem("diagnoses", JSON.stringify(updatedDiagnoses));
      alert("Diagnosis created successfully!");
    }

    navigate("/diagnosismanagement");
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>

      <Section className="cs_diagnosis">
        <div className="container">
          <div className="cs_diagnosis_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle={isUpdate ? "UPDATE DIAGNOSIS" : "CREATE DIAGNOSIS"} SectionTitle="Fill Diagnosis Form" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px" }}>
              <form className="cs_diagnosis_form row cs_gap_y_30" onSubmit={handleSubmit}>

                {/* Patient Information */}
                <div className="col-md-6">
                  <label className="cs_form_label">Patient Name</label>
                  <input type="text" className="cs_form_field" name="patientName" value={formData.patientName} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Patient ID</label>
                  <input type="text" className="cs_form_field" name="patientId" value={formData.patientId} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Gender</label>
                  <select className="cs_form_field" name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Date of Birth</label>
                  <input type="date" className="cs_form_field" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Phone Number</label>
                  <input type="text" className="cs_form_field" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Address</label>
                  <input type="text" className="cs_form_field" name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                {/* Symptoms */}
                <div className="col-md-12">
                  <label className="cs_form_label">Symptoms</label>
                  <textarea className="cs_form_field" name="symptoms" value={formData.symptoms} onChange={handleInputChange}></textarea>
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Start Time of Symptoms</label>
                  <input type="date" className="cs_form_field" name="symptomStartTime" value={formData.symptomStartTime} onChange={handleInputChange} />
                </div>

                <div className="col-md-6">
                  <label className="cs_form_label">Severity of Symptoms</label>
                  <select className="cs_form_field" name="symptomSeverity" value={formData.symptomSeverity} onChange={handleInputChange}>
                    <option value="">Select Severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                {/* Diagnosis */}
                <div className="col-md-12">
                  <label className="cs_form_label">Diagnosis</label>
                  <textarea className="cs_form_field" name="diagnosisFinal" value={formData.diagnosisFinal} onChange={handleInputChange}></textarea>
                </div>

                {/* Treatment Plan */}
                <div className="col-md-12">
                  <label className="cs_form_label">Treatment Plan</label>
                  <textarea className="cs_form_field" name="treatmentPlan" value={formData.treatmentPlan} onChange={handleInputChange}></textarea>
                </div>

                {/* Doctor Notes */}
                <div className="col-md-12">
                  <label className="cs_form_label">Doctor's Notes</label>
                  <textarea className="cs_form_field" name="doctorNotes" value={formData.doctorNotes} onChange={handleInputChange}></textarea>
                </div>

                {/* Submit Button */}
                <div className="col-md-12 text-center mt-4">
                  <button type="submit" className="cs_btn cs_style_1 cs_white_color" style={{ backgroundColor: "#007bff", padding: "10px 30px", borderRadius: "25px" }}>
                    {isUpdate ? "Update Diagnosis" : "Submit Diagnosis"}
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

export default DiagnosisForm;
