import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const PrescriptionManagement = () => {
  const headingData = { title: "Prescription Management" };
  const navigate = useNavigate();
  const location = useLocation();
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
    setPrescriptions(storedPrescriptions);
  }, []);

  useEffect(() => {
    if (location.state && location.state.updatedPrescriptions) {
      setPrescriptions(location.state.updatedPrescriptions);
    }
  }, [location.state]);

  const handleViewDetails = (id) => {
    navigate(`/prescriptiondetails/${id}`);
  };

  const handleUpdatePrescription = (id) => {
    navigate(`/updateprescription/${id}`);
  };

  // Xóa đơn thuốc
  const handleDeletePrescription = (id) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      const updatedPrescriptions = prescriptions.filter((prescription) => prescription.id !== id);
      
      // Cập nhật danh sách trong localStorage
      localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions));
      
      // Cập nhật state để giao diện hiển thị danh sách mới
      setPrescriptions(updatedPrescriptions);
    }
  };

  // Gửi đơn thuốc đến nhà thuốc
  const handleSendToPharmacy = (id) => {
    const updatedPrescriptions = prescriptions.map((prescription) =>
      prescription.id === id ? { ...prescription, sentToPharmacy: true } : prescription
    );

    localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions));
    setPrescriptions(updatedPrescriptions);
    alert("Prescription sent to pharmacy successfully!");
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>

      <Section className="cs_appointment">
        <div className="container">
          <SectionHeading SectionSubtitle="MANAGE PRESCRIPTIONS" SectionTitle="Prescription List" variant="text-center" />
          <div className="text-left mb-4">
            <button className="btn btn-primary" onClick={() => navigate("/prescriptionform")}>
              Create Prescription
            </button>
          </div>

          {/* Table displaying the list of prescriptions */}
          <div className="appointment-table">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Patient Name</th>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription, index) => (
                  <tr key={prescription.id}>
                    <td>{index + 1}</td>
                    <td>{prescription.patientName}</td>
                    <td>{prescription.medicineName}</td>
                    <td>{prescription.medicineDosage}</td>
                    <td>{prescription.medicineQuantity}</td>
                    <td>
                      {prescription.sentToPharmacy ? (
                        <span className="badge bg-success">Sent</span>
                      ) : (
                        <span className="badge bg-warning">Pending</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleViewDetails(prescription.id)}>
                        <FaEye color="white" /> View
                      </button>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdatePrescription(prescription.id)}>
                        <FaEdit color="white" /> Edit
                      </button>
                      <button className="btn btn-sm btn-danger me-2" onClick={() => handleDeletePrescription(prescription.id)}>
                        <FaTrash color="white" /> Delete
                      </button>
                      {!prescription.sentToPharmacy && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleSendToPharmacy(prescription.id)}>
                          <FaPaperPlane color="white" /> Send
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </>
  );
};

export default PrescriptionManagement;
