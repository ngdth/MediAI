import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit } from "react-icons/fa";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const DiagnosisManagement = () => {
  const headingData = { title: "Diagnosis Management" };
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState([]);

  // Lấy danh sách chẩn đoán từ localStorage khi trang được tải
  useEffect(() => {
    const storedDiagnoses = localStorage.getItem("diagnoses");
    if (storedDiagnoses) {
      setDiagnoses(JSON.parse(storedDiagnoses));
    }
  }, []);

  // Chuyển hướng đến DiagnosisDetailPage và truyền id của diagnosis qua URL
  const handleViewDetails = (id) => {
    navigate(`/diagnosisdetails/${id}`);  
  };

  // Chuyển hướng đến UpdateDiagnosisPage và truyền id của diagnosis qua URL
  const handleUpdateDiagnosis = (id) => {
    navigate(`/updatediagnosis/${id}`);  
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>

      <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120" className="cs_appointment">
        <div className="container">
          <SectionHeading SectionSubtitle="MANAGE DIAGNOSIS" SectionTitle="Diagnosis List" variant="text-center" />
          <div className="cs_height_40 cs_height_lg_35" />

          {/* Button to create a new diagnosis - Align left */}
          <div className="text-left mb-4">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/diagnosisform")}
            >
              Create Diagnosis
            </button>
          </div>

          {/* Table displaying the list of diagnoses */}
          <div className="appointment-table">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Patient Name</th>
                  <th>Preliminary Diagnosis</th>
                  <th>Final Diagnosis</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((diagnosis, index) => (
                  <tr key={diagnosis.id}>
                    <td>{index + 1}</td>
                    <td>{diagnosis.patientName}</td>
                    <td>{diagnosis.diagnosisPreliminary}</td>
                    <td>{diagnosis.diagnosisFinal}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-info me-2"  
                        onClick={() => handleViewDetails(diagnosis.id)}
                      >
                        <FaEye color="white" /> View Details
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleUpdateDiagnosis(diagnosis.id)}
                      >
                        <FaEdit color="white" /> Update
                      </button>
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

export default DiagnosisManagement;
