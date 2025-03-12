// TopBar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const TopBar = ({ isSidebarOpen }) => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const navigate = useNavigate();

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
              <div className="cs_main_header_left ps-5 pt-2">
                <Link className="cs_site_branding h1 bold" to="/">
                  Nurse
                </Link>
              </div>
              {username && (
                <div className="cs_main_header_right">
                  <div className="cs_nav cs_primary_color">
                    <ul className="cs_nav_list">
                      <li className="menu-item-has-children">
                        <Link className="text-white">{username}</Link>
                        <ul>
                          <li>
                            <Link to="/profile">Profile</Link>
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
        </div></div>
    </header>
  );
};

export default TopBar;
