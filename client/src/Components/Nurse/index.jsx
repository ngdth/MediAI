import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const NurseDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({
    pending: 0,
    assigned: 0,
    accepted: 0,
    canceled: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_URL}/appointment`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const appointments = response.data.data;
      setAppointments(appointments);
      setAppointmentStats({
        pending: appointments.filter(a => a.status === "Pending").length,
        assigned: appointments.filter(a => a.status === "Assigned").length,
        accepted: appointments.filter(a => a.status === "Accepted").length,
        canceled: appointments.filter(a => a.status === "Canceled").length,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const chartData = {
    labels: ["Pending", "Assigned", "Accepted", "Canceled"],
    datasets: [
      {
        label: "Appointments",
        data: [
          appointmentStats.pending,
          appointmentStats.assigned,
          appointmentStats.accepted,
          appointmentStats.canceled,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="nurse-dashboard">
      <h3>Dashboard</h3>
      <div className="chart-container">
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default NurseDashboard;
