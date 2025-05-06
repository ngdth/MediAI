import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEllipsisV, FaEye, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

//Nurse will accept and manage patient's reservation.
const DoctorAppointments = () => {
  const headingData = { title: "Patient Appointments" };
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const storedAppointments = localStorage.getItem("appointments");
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    } else {
      const defaultData = [
        { id: 1, patient: "Nguyễn Văn A", date: "10/02/2025 09:00", status: "Waiting" },
        { id: 2, patient: "Trần Thị B", date: "12/02/2025 14:00", status: "Waiting" },
        { id: 3, patient: "Lê Văn C", date: "15/02/2025 11:00", status: "Waiting" },
      ];
      setAppointments(defaultData);
      localStorage.setItem("appointments", JSON.stringify(defaultData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen !== null &&
        dropdownRefs.current[dropdownOpen] &&
        !dropdownRefs.current[dropdownOpen].contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const updateAppointments = (newAppointments) => {
    setAppointments(newAppointments);
    localStorage.setItem("appointments", JSON.stringify(newAppointments));
  };

  const handleAccept = (id) => {
    updateAppointments(
      appointments.map((appt) => (appt.id === id ? { ...appt, status: "Accepted" } : appt))
    );
  };

  const handleCancel = (id) => {
    updateAppointments(appointments.filter((appt) => appt.id !== id));
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateAppointments(
      appointments.map((appt) => (appt.id === id ? { ...appt, status: newStatus } : appt))
    );
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>
      <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120" className="cs_appointment">
        <div className="container">
          <SectionHeading SectionSubtitle="PATIENT APPOINTMENTS" SectionTitle="Manage Appointments" variant="text-center" />
          <div className="cs_height_40 cs_height_lg_35" />
          <div className="appointment-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.date}</td>
                    <td>{appointment.patient}</td>
                    <td>{appointment.status}</td>
                    <td className="text-center">
                      <div className="btn-group" ref={(el) => (dropdownRefs.current[appointment.id] = el)}>
                        <button className="btn btn-sm btn-light" onClick={() => setDropdownOpen(dropdownOpen === appointment.id ? null : appointment.id)}>
                          <FaEllipsisV color="blue" />
                        </button>
                        {dropdownOpen === appointment.id && (
                          <div className="dropdown-menu show" style={{ display: "block", position: "absolute", zIndex: 1000 }}>
                            <button className="dropdown-item" onClick={() => navigate(`/appointment/${appointment.id}`)}>
                              <FaEye color="blue" /> View Details
                            </button>
                            {appointment.status === "Waiting" && (
                              <>
                                <button className="dropdown-item" onClick={() => handleAccept(appointment.id)}>
                                  <FaCheck color="blue" /> Accept
                                </button>
                                <button className="dropdown-item" onClick={() => handleCancel(appointment.id)}>
                                  <FaTrash color="blue" /> Cancel
                                </button>
                              </>
                            )}
                            {appointment.status !== "Completed" && appointment.status !== "Waiting" && (
                              <>
                                {appointment.status === "Accepted" && (
                                  <button className="dropdown-item" onClick={() => handleUpdateStatus(appointment.id, "In Progress")}> 
                                    <FaEdit color="blue" /> In Progress
                                  </button>
                                )}
                                {appointment.status === "In Progress" && (
                                  <button className="dropdown-item" onClick={() => handleUpdateStatus(appointment.id, "Completed")}> 
                                    <FaEdit color="blue" /> Completed
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
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

export default DoctorAppointments;
