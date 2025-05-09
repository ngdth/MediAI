import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_URL}/appointment/hod/specialization`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAppointments = React.useMemo(() => {
    const sortable = [...appointments];
    if (!sortConfig.key) return sortable;

    return sortable.sort((a, b) => {
      const apA = a.appointment;
      const apB = b.appointment;

      if (sortConfig.key === "patientName") {
        return sortConfig.direction === "asc"
          ? apA.patientName.localeCompare(apB.patientName)
          : apB.patientName.localeCompare(apA.patientName);
      }

      if (sortConfig.key === "status") {
        return sortConfig.direction === "asc"
          ? apA.status.localeCompare(apB.status)
          : apB.status.localeCompare(apA.status);
      }

      if (sortConfig.key === "time") {
        const aDateTime = new Date(`${apA.date}T${apA.time}:00`);
        const bDateTime = new Date(`${apB.date}T${apB.time}:00`);
        return sortConfig.direction === "asc"
          ? aDateTime - bDateTime
          : bDateTime - aDateTime;
      }

      if (sortConfig.key === "doctor") {
        const nameA = apA.doctorId.map((d) => d.username).join(", ");
        const nameB = apB.doctorId.map((d) => d.username).join(", ");
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      return 0;
    });
  }, [appointments, sortConfig]);

  const handleViewDetail = (appointmentId) => {
    navigate(`/hod/general-health/${appointmentId}`);
  };

  return (
    <div className="pending">
      <h2>Lịch sử lịch hẹn trong khoa</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort("patientName")} style={{ cursor: "pointer" }}>
                Tên bệnh nhân {sortConfig.key === "patientName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("time")} style={{ cursor: "pointer" }}>
                Thời gian khám {sortConfig.key === "time" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                Trạng thía {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("doctor")} style={{ cursor: "pointer" }}>
                Bác sĩ phụ trách {sortConfig.key === "doctor" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((item) => {
                const ap = item.appointment;
                const doctorNames = ap.doctorId.map((d) => d.username).join(", ");
                return (
                  <tr key={ap._id}>
                    <td>{ap.patientName}</td>
                    <td>{new Date(ap.date).toLocaleDateString("vi-VN")} {ap.time}</td>
                    <td>{ap.status}</td>
                    <td>{doctorNames || "N/A"}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleViewDetail(ap._id)}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="5">Không có lịch khám nào.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorAppointmentList;
