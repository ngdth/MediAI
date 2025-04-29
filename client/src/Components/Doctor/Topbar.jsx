import { useState, useEffect, useRef } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TopBar = ({ isSidebarOpen }) => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("unread");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchUserId = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      const response = await axios.get("https://amma-care.com/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User data from /user/me:", response.data);
      setUserId(response.data.id);
      setUsername(response.data.username);
    } catch (error) {
      console.error("Error fetching user ID:", error.response?.data || error.message);
    }
  };

  const fetchNotifications = async () => {
    if (!userId) {
      console.log("No userId yet, skipping fetchNotifications");
      return;
    }
    try {
      const response = await axios.get(
        `https://amma-care.com/notification/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Notifications from API:", response.data);
      const sortedNotifications = (response.data.data || []).sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setNotifications(sortedNotifications);
      console.log("Updated notifications state:", sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    setUserId(null);
    navigate("/login");
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `https://amma-care.com/notification/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification._id);
    if (notification.relatedId) {
      navigate(`/doctor/appointments/manage-result/${notification.relatedId}`);
    }
    setShowNotifications(false);
  };

  const unreadNotifications = notifications.filter((notif) => !notif.isRead);
  const readNotifications = notifications.filter((notif) => notif.isRead);

  return (
    <header className="cs_site_header cs_style_1 cs_primary_color cs_sticky_header">
      <div className={`topbar ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              <div className="cs_main_header_left ps-5 pt-2">
                <Link className="cs_site_branding h1 bold" to="/">
                  Doctor
                </Link>
              </div>
              {username && (
                <div className="cs_main_header_right">
                  <div className="cs_nav cs_primary_color">
                    <ul className="cs_nav_list">
                      <li className="notification-container" ref={dropdownRef}>
                        <button
                          className="notification-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications((prev) => !prev);
                          }}
                          style={{ position: "relative" }}
                        >
                          <FaBell size={20} style={{ fill: "white" }} />
                          {unreadNotifications.length > 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                            >
                              {unreadNotifications.length}
                            </span>
                          )}
                        </button>
                        {showNotifications && (
                          <div className="notification-panel">
                            <div className="notification-header d-flex justify-content-between align-items-center">
                              <h5>Thông báo</h5>
                              <div>
                                <a
                                  className={`nav-link d-inline ${activeTab === "unread" ? "active" : ""
                                    }`}
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab("unread");
                                  }}
                                >
                                  Chưa đọc
                                </a>
                                <a
                                  className={`nav-link d-inline ${activeTab === "read" ? "active" : ""
                                    }`}
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab("read");
                                  }}
                                >
                                  Đã đọc
                                </a>
                              </div>
                            </div>
                            <div className="notification-body">
                              {(activeTab === "unread" ? unreadNotifications : readNotifications).length > 0 ? (
                                (activeTab === "unread" ? unreadNotifications : readNotifications).map((notif) => (
                                  <div
                                    key={notif._id}
                                    className="notification-item"
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                                    onClick={() => handleNotificationClick(notif)}
                                  >
                                    <div className="notification-text">
                                      <p>{notif.message}</p>
                                      <p className="text-muted">
                                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                                      </p>
                                    </div>
                                    {activeTab === "unread" && (
                                      <FaCheck
                                        size={16}
                                        style={{ cursor: "pointer", color: "green" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markNotificationAsRead(notif._id);
                                        }}
                                      />
                                    )}
                                    <i
                                      className={`fas ${notif.type === "appointment" ? "fa-calendar" : "fa-bell"
                                        } notification-icon`}
                                    ></i>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center p-3">
                                  {activeTab === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo đã đọc"}
                                </p>
                              )}
                            </div>
                            <div className="notification-footer">
                              <button>Xem thêm</button>
                            </div>
                          </div>
                        )}
                      </li>
                      <li>
                        <Link to="/blog" className="custom-blog-btn">
                          View Blog
                        </Link>
                      </li>
                      <li className="menu-item-has-children">
                        <Link className="text-white">{username}</Link>
                        <ul>
                          <li>
                            <Link to="/doctor/profile">Hồ Sơ</Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                              }}
                            >
                              Logout
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;