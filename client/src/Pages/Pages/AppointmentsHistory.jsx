import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const AppointmentsHistory = () => {
  const headingData = {
    title: "Appointment History",
  };

  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = [
        { id: 1, doctor: "Dr. Nguyễn Văn A", date: "01/02/2025 10:00", status: "Completed" },
        { id: 2, doctor: "Dr. Trần Thị B", date: "03/02/2025 14:30", status: "Canceled" },
        { id: 3, doctor: "Dr. Lê Văn C", date: "05/02/2025 09:00", status: "Waiting" },
      ];
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const handleUpdate = (id) => {
    navigate(`/updateappointment/${id}`);
  };

  const handleCancel = (id) => {
    Swal.fire({
      title: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",

      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Đã hủy!", `Cuộc hẹn ID ${id} đã bị hủy.`, "success");
        // Gọi API để hủy cuộc hẹn tại đây
      }
    });
  };

  return (
    <>
      <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
        <PageHeading data={headingData} />
      </Section>
      <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120" className="cs_appointment">
        <div className="container">
          <div className="cs_appointment_form_wrapper">
            <SectionHeading SectionSubtitle="APPOINTMENT HISTORY" SectionTitle="Your Past Appointments" variant="text-center" />
            <div className="cs_height_40 cs_height_lg_35" />
            <div className="appointment-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className={appointment.status.toLowerCase().replace(" ", "-")}>
                      <td>{appointment.date}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.status}</td>
                      <td>
                        <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdate(appointment.id)}>
                          Update
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appointment.id)}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default AppointmentsHistory;
