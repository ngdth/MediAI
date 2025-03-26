import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

const TopBar = ({ isSidebarOpen }) => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [notifications, setNotifications] = useState([
    {
      user: "Bác sĩ A",
      message: "Bạn có lịch hẹn mới vào ngày mai",
      time: "1h",
      type: "calendar",
    },
    {
      user: "Hệ thống",
      message: "Cập nhật quan trọng về hệ thống",
      time: "3h",
      type: "system",
    },
    {
      user: "Bác sĩ B",
      message: "Tin nhắn từ bác sĩ của bạn",
      time: "5h",
      type: "message",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleLogin = () => {
      setUsername(localStorage.getItem("username"));
    };

    window.addEventListener("loginSuccess", handleLogin);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/login");
  };

  return (
    <header className="cs_site_header cs_style_1 cs_primary_color cs_sticky_header">
      <div className={`topbar ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              {/* Logo */}
              <div className="cs_main_header_left ps-5 pt-2">
                <Link className="cs_site_branding h1 bold" to="/">
                  Doctor
                </Link>
              </div>

              {/* Nút thông báo và tài khoản */}
              {username && (
                <div className="cs_main_header_right">
                  <div className="cs_nav cs_primary_color">
                    <ul className="cs_nav_list">
                      {/* Nút Thông Báo */}
                      <li className="notification-container" ref={dropdownRef}>
                        <button
                          className="notification-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications((prev) => !prev);
                          }}
                        >
                          <Bell size={20} />
                        </button>

                        {/* Dropdown Thông Báo */}
                        {showNotifications && (
                          <div className="notification-panel">
                            <div className="notification-header d-flex justify-content-between align-items-center">
                              <h5>Thông báo</h5>
                              <div>
                                <a className="nav-link d-inline" href="#">
                                  Tất cả
                                </a>
                                <a className="nav-link d-inline" href="#">
                                  Chưa đọc
                                </a>
                              </div>
                            </div>
                            <div className="notification-body">
                              {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                  <div key={index} className="notification-item">
                                    <div className="notification-text">
                                      <p>
                                        <strong>{notif.user}</strong>: {notif.message}
                                      </p>
                                      <p className="text-muted">{notif.time}</p>
                                    </div>
                                    <i className={`fas ${notif.type === "message" ? "fa-comment-dots" : "fa-bell"} notification-icon`}></i>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center p-3">Không có thông báo mới</p>
                              )}
                            </div>
                            <div className="notification-footer">
                              <button>Xem thêm</button>
                            </div>
                          </div>
                        )}
                      </li>

                      {/* Tài Khoản Người Dùng */}
                      <li className="menu-item-has-children">
                        <Link className="text-white">{username}</Link>
                        <ul>
                          <li>
                            <Link to="/profile">Hồ Sơ</Link>
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

      {/* Styles */}
   
    </header>
  );
};

export default TopBar;
