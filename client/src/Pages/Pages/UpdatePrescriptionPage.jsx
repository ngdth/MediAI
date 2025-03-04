import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const UpdatePrescriptionPage = () => {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();
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

  // Load dữ liệu đơn thuốc từ localStorage khi trang được tải
  useEffect(() => {
    const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
    const prescriptionToEdit = storedPrescriptions.find((prescription) => prescription.id === parseInt(prescriptionId));

    if (prescriptionToEdit) {
      setFormData(prescriptionToEdit);
    }
  }, [prescriptionId]);

  // Cập nhật dữ liệu khi người dùng nhập
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit - Cập nhật dữ liệu trong localStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    let storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
    storedPrescriptions = storedPrescriptions.map((prescription) =>
      prescription.id === parseInt(prescriptionId) ? { ...prescription, ...formData } : prescription
    );

    localStorage.setItem("prescriptions", JSON.stringify(storedPrescriptions));
    alert("Prescription updated successfully!");

    // Chuyển về trang PrescriptionManagement với dữ liệu mới cập nhật
    navigate("/prescriptionmanagement", { state: { updatedPrescriptions: storedPrescriptions } });
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={{ title: "Update Prescription" }} />
      </Section>

      <Section className="cs_prescription">
        <div className="container">
          <div className="cs_prescription_form_wrapper" style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
            <div className="text-center" style={{ marginBottom: "40px" }}>
              <SectionHeading SectionSubtitle="UPDATE PRESCRIPTION" SectionTitle="Update Prescription Form" variant="text-center" />
            </div>

            <div className="cs_form_card" style={{ background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "30px" }}>
              <form className="cs_prescription_form row cs_gap_y_30" onSubmit={handleSubmit}>
                
                {/* Hiển thị tất cả các trường */}
                <div className="col-md-6">
                  <label className="cs_form_label">Patient's Full Name</label>
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

                {/* Thông tin bác sĩ */}
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's Full Name</label>
                  <input type="text" className="cs_form_field" name="doctorName" value={formData.doctorName} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's Specialty</label>
                  <input type="text" className="cs_form_field" name="doctorSpecialty" value={formData.doctorSpecialty} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Doctor's License Number</label>
                  <input type="text" className="cs_form_field" name="doctorLicense" value={formData.doctorLicense} onChange={handleInputChange} />
                </div>

                {/* Thông tin thuốc */}
                <div className="col-md-12">
                  <label className="cs_form_label">Medicine Name</label>
                  <input type="text" className="cs_form_field" name="medicineName" value={formData.medicineName} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Dosage</label>
                  <input type="text" className="cs_form_field" name="medicineDosage" value={formData.medicineDosage} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                  <label className="cs_form_label">Quantity</label>
                  <input type="number" className="cs_form_field" name="medicineQuantity" value={formData.medicineQuantity} onChange={handleInputChange} />
                </div>

                {/* Hướng dẫn điều trị */}
                <div className="col-md-12">
                  <label className="cs_form_label">Usage Instructions</label>
                  <textarea className="cs_form_field" name="usageInstructions" value={formData.usageInstructions} onChange={handleInputChange}></textarea>
                </div>

                {/* Submit */}
                <div className="col-md-12 text-center mt-4">
                  <button type="submit" className="cs_btn cs_style_1 cs_white_color" style={{ backgroundColor: "#007bff", borderColor: "#007bff", padding: "10px 30px", borderRadius: "25px" }}>
                    Update Prescription
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

export default UpdatePrescriptionPage;
