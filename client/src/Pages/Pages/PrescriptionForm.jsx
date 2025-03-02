import React, { useState } from "react";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import "react-datepicker/dist/react-datepicker.css";

const PrescriptionForm = () => {
  const headingData = {
    title: "Prescription Form",
  };

  // Form data
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    gender: "",
    birthDate: "",
    phone: "",
    address: "",
    doctorName: "",
    doctorSpecialty: "",
    doctorLicense: "",
    medicineName: "",
    medicineDosage: "",
    medicineQuantity: "",
    usageInstructions: "",
    treatmentDuration: "",
    treatmentPlan: "",
    followUpInstructions: "",
    additionalNotes: "",
  });

  // Cập nhật formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit - Lưu vào localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
    const newPrescription = { id: Date.now(), ...formData };
    const updatedPrescriptions = [...existingPrescriptions, newPrescription];

    localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions));

    console.log("Prescription Data Saved:", newPrescription);
    alert("Prescription submitted successfully!");

    setFormData({
      patientName: "",
      patientId: "",
      gender: "",
      birthDate: "",
      phone: "",
      address: "",
      doctorName: "",
      doctorSpecialty: "",
      doctorLicense: "",
      medicineName: "",
      medicineDosage: "",
      medicineQuantity: "",
      usageInstructions: "",
      treatmentDuration: "",
      treatmentPlan: "",
      followUpInstructions: "",
      additionalNotes: "",
    });
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>

      <Section className="cs_prescription">
        <div className="container">
          <div className="cs_prescription_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle="CREATE PRESCRIPTION" SectionTitle="Fill Prescription Form" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px" }}>
              <form className="cs_prescription_form row cs_gap_y_30" onSubmit={handleSubmit}>

                {/* Thông tin bệnh nhân */}
                <div className="col-md-6">
                  <label className="cs_form_label">Patient's Full Name</label>
                  <input type="text" className="cs_form_field" name="patientName" placeholder="Enter patient's full name" value={formData.patientName} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Patient ID</label>
                  <input type="text" className="cs_form_field" name="patientId" placeholder="Enter patient's ID" value={formData.patientId} onChange={handleInputChange} />
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
                  <input type="text" className="cs_form_field" name="phone" placeholder="Enter patient's phone number" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Address</label>
                  <input type="text" className="cs_form_field" name="address" placeholder="Enter patient's address" value={formData.address} onChange={handleInputChange} />
                </div>

                {/* Thông tin bác sĩ */}
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's Full Name</label>
                  <input type="text" className="cs_form_field" name="doctorName" placeholder="Enter doctor's full name" value={formData.doctorName} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's Specialty</label>
                  <input type="text" className="cs_form_field" name="doctorSpecialty" placeholder="Enter doctor's specialty" value={formData.doctorSpecialty} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's License Number</label>
                  <input type="text" className="cs_form_field" name="doctorLicense" placeholder="Enter doctor's license number" value={formData.doctorLicense} onChange={handleInputChange} />
                </div>

                {/* Thông tin thuốc */}
                <div className="col-md-12">
                  <label className="cs_form_label">Medicine Name</label>
                  <input type="text" className="cs_form_field" name="medicineName" placeholder="Enter medicine name" value={formData.medicineName} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Dosage</label>
                  <input type="text" className="cs_form_field" name="medicineDosage" placeholder="Enter dosage" value={formData.medicineDosage} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Quantity</label>
                  <input type="number" className="cs_form_field" name="medicineQuantity" placeholder="Enter quantity" value={formData.medicineQuantity} onChange={handleInputChange} />
                </div>

                {/* Hướng dẫn và phác đồ */}
                <div className="col-md-12">
                  <label className="cs_form_label">Usage Instructions</label>
                  <textarea className="cs_form_field" name="usageInstructions" placeholder="Enter usage instructions" value={formData.usageInstructions} onChange={handleInputChange}></textarea>
                </div>

                {/* Submit */}
                <div className="col-md-12 text-center mt-4">
                  <button type="submit" className="cs_btn cs_style_1 cs_white_color" style={{ backgroundColor: "#007bff", borderColor: "#007bff", padding: "10px 30px", borderRadius: "25px" }}>
                    Submit Prescription
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

export default PrescriptionForm;
