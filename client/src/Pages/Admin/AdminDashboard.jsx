import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  UserPlus,
  ScissorsSquare,
  Banknote,
} from "lucide-react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0); // Tổng doanh thu
  const [weeklyRevenue, setWeeklyRevenue] = useState([]); // Doanh thu theo tuần
  const [monthlyRevenue, setMonthlyRevenue] = useState([]); // Doanh thu theo tháng
  const [loadingRevenue, setLoadingRevenue] = useState(true); // Trạng thái tải doanh thu
  const [userData, setUserData] = useState([]);
  const [hospitalSurveyData, setHospitalSurveyData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const defaultAvatar = "https://randomuser.me/api/portraits/lego/1.jpg";

  useEffect(() => {
    fetchAppointments();
    fetchBills();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const users = response.data;

      const filteredUsers = users.filter((user) => user.role === "user");

      console.log("Dữ liệu người dùng với role 'user':", filteredUsers);

      const userCountByMonth2024 = {};
      const userCountByMonth2025 = {};

      filteredUsers.forEach((user) => {
        const date = new Date(user.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        const key = `${monthStr}/${year}`;

        if ((year === 2024 || year === 2025) && month >= 1 && month <= 5) {
          if (year === 2024) {
            userCountByMonth2024[key] = (userCountByMonth2024[key] || 0) + 1;
          } else if (year === 2025) {
            userCountByMonth2025[key] = (userCountByMonth2025[key] || 0) + 1;
          }
        }
      });

      console.log("Số lượng người dùng theo tháng 2024:", userCountByMonth2024);
      console.log("Số lượng người dùng theo tháng 2025:", userCountByMonth2025);

      const formattedData = [];
      for (let month = 1; month <= 5; month++) {
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        formattedData.push({
          date: `${monthStr}/2024`,
          patients2024: userCountByMonth2024[`${monthStr}/2024`] || 0,
          patients2025: userCountByMonth2025[`${monthStr}/2025`] || 0,
        });
      }

      console.log("Dữ liệu đã định dạng cho biểu đồ:", formattedData);

      setHospitalSurveyData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BE_URL}/appointment/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Appointments data:", response.data);
      setAppointments(response.data.data);
      setFilteredAppointments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  // Fetch bills và xử lý thống kê
  const fetchBills = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BE_URL}/pharmacy/bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Bills data:", response.data);

      const bills = response.data.bills || [];

      // Tính tổng doanh thu (chỉ tính hóa đơn Paid)
      const total = bills
        .filter((bill) => bill.paymentStatus === "Paid")
        .reduce((sum, bill) => sum + bill.totalAmount, 0);
      setTotalRevenue(total);

      // Nhóm dữ liệu theo tuần
      const weeklyData = {};
      bills
        .filter((bill) => bill.paymentStatus === "Paid")
        .forEach((bill) => {
          const date = new Date(bill.dateIssued);
          const year = date.getFullYear();
          const week = getWeekNumber(date); // Hàm tính số tuần
          const key = `${year}-W${week}`;
          if (!weeklyData[key]) {
            weeklyData[key] = { year, week, total: 0, count: 0 };
          }
          weeklyData[key].total += bill.totalAmount;
          weeklyData[key].count += 1;
        });

      const formattedWeeklyData = Object.values(weeklyData)
        .map((item) => ({
          date: `Week ${item.week} ${item.year}`,
          value: item.total,
        }))
        .sort((a, b) => {
          const [weekA, yearA] = a.date.match(/\d+/g);
          const [weekB, yearB] = b.date.match(/\d+/g);
          return yearA - yearB || weekA - weekB;
        });
      setWeeklyRevenue(formattedWeeklyData);

      // Nhóm dữ liệu theo tháng
      const monthlyData = {};
      bills
        .filter((bill) => bill.paymentStatus === "Paid")
        .forEach((bill) => {
          const date = new Date(bill.dateIssued);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() trả về 0-11
          const key = `${year}-${month}`;
          if (!monthlyData[key]) {
            monthlyData[key] = { year, month, total: 0, count: 0 };
          }
          monthlyData[key].total += bill.totalAmount;
          monthlyData[key].count += 1;
        });

      const formattedMonthlyData = Object.values(monthlyData)
        .map((item) => ({
          date: `${item.month}/${item.year}`,
          value: item.total,
        }))
        .sort((a, b) => {
          const [monthA, yearA] = a.date.split("/");
          const [monthB, yearB] = b.date.split("/");
          return yearA - yearB || monthA - monthB;
        });
      setMonthlyRevenue(formattedMonthlyData);

      setLoadingRevenue(false);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setLoadingRevenue(false);
    }
  };

  // Hàm tính số tuần trong năm (dựa trên ISO week)
  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  // Handle search (giữ nguyên)
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter((item) => {
      const appointment = item.appointment;

      const nameMatch = appointment.patientName?.toLowerCase().includes(term);
      const emailMatch = appointment.email?.toLowerCase().includes(term);
      const dateMatch = appointment.date
        ? new Date(appointment.date)
          .toLocaleDateString("en-US")
          .toLowerCase()
          .includes(term)
        : false;
      const timeMatch = appointment.time?.toLowerCase().includes(term);
      const doctorMatch = appointment.doctorId
        .map((doctor) => doctor.username?.toLowerCase() || "")
        .join(", ")
        .includes(term);
      const conditionMatch = appointment.symptoms?.toLowerCase().includes(term);

      return (
        nameMatch ||
        emailMatch ||
        dateMatch ||
        timeMatch ||
        doctorMatch ||
        conditionMatch
      );
    });

    setFilteredAppointments(filtered);
  };

  // Handle sort (giữ nguyên)
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAppointments = React.useMemo(() => {
    const sortableAppointments = [...filteredAppointments];
    if (!sortConfig.key) return sortableAppointments;

    sortableAppointments.sort((a, b) => {
      const appointmentA = a.appointment;
      const appointmentB = b.appointment;

      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? appointmentA.patientName.localeCompare(appointmentB.patientName)
          : appointmentB.patientName.localeCompare(appointmentA.patientName);
      }

      if (sortConfig.key === "email") {
        return sortConfig.direction === "asc"
          ? appointmentA.email.localeCompare(appointmentB.email)
          : appointmentB.email.localeCompare(appointmentA.email);
      }

      if (sortConfig.key === "date") {
        const aDateTime = new Date(
          `${new Date(appointmentA.date).toISOString().split("T")[0]}T${appointmentA.time
          }:00`
        );
        const bDateTime = new Date(
          `${new Date(appointmentB.date).toISOString().split("T")[0]}T${appointmentB.time
          }:00`
        );
        if (isNaN(aDateTime.getTime()) || isNaN(bDateTime.getTime())) {
          return 0;
        }
        return sortConfig.direction === "asc"
          ? aDateTime - bDateTime
          : bDateTime - aDateTime;
      }

      if (sortConfig.key === "doctor") {
        const aDoctorNames = appointmentA.doctorId
          .map((doctor) => doctor.username)
          .join(", ");
        const bDoctorNames = appointmentB.doctorId
          .map((doctor) => doctor.username)
          .join(", ");
        return sortConfig.direction === "asc"
          ? aDoctorNames.localeCompare(bDoctorNames)
          : bDoctorNames.localeCompare(aDoctorNames);
      }

      if (sortConfig.key === "condition") {
        return sortConfig.direction === "asc"
          ? appointmentA.symptoms.localeCompare(appointmentB.symptoms)
          : appointmentB.symptoms.localeCompare(appointmentA.symptoms);
      }

      return 0;
    });
    return sortableAppointments;
  }, [filteredAppointments, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = sortedAppointments.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="stats">
        <div className="stat-card">
          <CalendarDays size={28} color="#407bff" />
          <div>
            Appointments <strong>213</strong>
          </div>
        </div>
        <div className="stat-card">
          <UserPlus size={28} color="#407bff" />
          <div>
            New Patients <strong>104</strong>
          </div>
        </div>
        <div className="stat-card">
          <ScissorsSquare size={28} color="#407bff" />
          <div>
            Operations <strong>24</strong>
          </div>
        </div>
        <div className="stat-card">
          <Banknote size={28} color="#407bff" />
          <div>
            Tổng doanh thu{" "}
            <strong>
              {loadingRevenue
                ? "Loading..."
                : `${totalRevenue.toLocaleString()} VND`}
            </strong>
          </div>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Thống kê người dùng</h3>
          {loading ? (
            <p>Đang Tải...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hospitalSurveyData}>
                <Line type="monotone" dataKey="patients2024" stroke="#f6b93b" fill="#f6b93b22" dot={false} />
                <Line type="monotone" dataKey="patients2025" stroke="#407bff" fill="#407bff22" dot={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-box">
          <h3>Doanh thu theo tháng</h3>
          {loadingRevenue ? (
            <p>Đang tải...</p>
          ) : monthlyRevenue.length === 0 ? (
            <p>Không có dữ liệu doanh thu tháng.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyRevenue}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#407bff"
                  fill="#407bff22"
                  dot
                />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} VND`}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-box">
          <h3>Doanh thu theo tuần</h3>
          {loadingRevenue ? (
            <p>Đang tải...</p>
          ) : weeklyRevenue.length === 0 ? (
            <p>Không có dữ liệu doanh thu tuần.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyRevenue}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f6b93b"
                  fill="#f6b93b22"
                  dot
                />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} VND`}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="table-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0px",
          }}
        >
          <h3 style={{ margin: 0 }}>Thống kê lịch hẹn</h3>
          <div className="search-bar" style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by name, email, date, time, doctor, or condition..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                padding: "8px 32px 8px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "300px",
              }}
            />
            <FaSearch
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>
                    <span
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Họ tên{" "}
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th>
                    <span
                      onClick={() => handleSort("email")}
                      style={{ cursor: "pointer" }}
                    >
                      Email{" "}
                      {sortConfig.key === "email" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th>
                    <span
                      onClick={() => handleSort("date")}
                      style={{ cursor: "pointer" }}
                    >
                      Ngày đặt{" "}
                      {sortConfig.key === "date" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th>
                    <span
                      onClick={() => handleSort("date")}
                      style={{ cursor: "pointer" }}
                    >
                      Thời gian đặt{" "}
                      {sortConfig.key === "date" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th>
                    <span
                      onClick={() => handleSort("doctor")}
                      style={{ cursor: "pointer" }}
                    >
                      Bác sĩ{" "}
                      {sortConfig.key === "doctor" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th>
                    <span
                      onClick={() => handleSort("condition")}
                      style={{ cursor: "pointer" }}
                    >
                      Tình trạng{" "}
                      {sortConfig.key === "condition" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </span>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.length > 0 ? (
                  currentAppointments.map((item, idx) => {
                    const appointment = item.appointment;
                    const doctorNames = appointment.doctorId
                      .map((doctor) => doctor.username)
                      .join(", ");
                    const formattedDate = new Date(
                      appointment.date
                    ).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    });
                    const formattedTime = appointment.time;

                    return (
                      <tr key={idx}>
                        <td>
                          <img
                            src={defaultAvatar}
                            alt="avatar"
                            className="avatar"
                          />{" "}
                          {appointment.patientName}
                        </td>
                        <td>{appointment.email}</td>
                        <td>{formattedDate}</td>
                        <td>{formattedTime}</td>
                        <td>{doctorNames || "No doctor assigned"}</td>
                        <td>{appointment.symptoms}</td>                        
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7">Không có lịch hẹn nào.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <div>
                Đang hiển thị {indexOfFirstItem + 1} đến{" "}
                {Math.min(indexOfLastItem, sortedAppointments.length)} của{" "}
                {sortedAppointments.length} lịch hẹn
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    background: currentPage === 1 ? "#f0f0f0" : "#fff",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Trang trước
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    background: currentPage === totalPages ? "#f0f0f0" : "#fff",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Trang tiếp
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
