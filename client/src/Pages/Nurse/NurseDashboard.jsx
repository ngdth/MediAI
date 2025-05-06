// Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    canceled: 0,
    accepted: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log("Fetching stats...");

      const [pendingResponse, assignedResponse, canceledResponse, acceptedResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BE_URL}/appointment?status=Pending`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${import.meta.env.VITE_BE_URL}/appointment?status=Assigned`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${import.meta.env.VITE_BE_URL}/appointment?status=Canceled`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${import.meta.env.VITE_BE_URL}/appointment?status=Accepted`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      ]);

      const pendingCount = pendingResponse.data?.data?.length || 0;
      const assignedCount = assignedResponse.data?.data?.length || 0;
      const canceledCount = canceledResponse.data?.data?.length || 0;
      const acceptedCount = acceptedResponse.data?.data?.length || 0;

      console.log("Pending appointments:", pendingCount);
      console.log("Assigned appointments:", assignedCount);
      console.log("Canceled appointments:", canceledCount);
      console.log("Accepted appointments:", acceptedCount);

      setStats({
        pending: pendingCount,
        assigned: assignedCount,
        canceled: canceledCount,
        accepted: acceptedCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const chartData = {
    labels: ["Pending", "Assigned", "Canceled", "Accepted"],
    datasets: [
      {
        label: "Appointments",
        data: [stats.pending, stats.assigned, stats.canceled, stats.accepted],
        backgroundColor: ["#f39c12", "#27ae60", "#e74c3c", "#3498db"],
      },
    ],
  };

  console.log("Chart data: ", chartData);

  return (
    <div className="nurse-dashboard">
      <h2>Dashboard</h2>
      {chartData.datasets[0].data.every(value => value === 0) ? (
        <p>No data available for chart.</p>
      ) : (
        <Bar data={chartData} />
      )}
    </div>
  );
};

export default Dashboard;
