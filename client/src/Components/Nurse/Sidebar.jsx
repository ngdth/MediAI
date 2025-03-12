// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaClipboard, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="menu-list">
          <li>
            <Link to="/nurse/dashboard" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/nurse/pending" className="menu-item">
              <FaClipboard className="menu-icon" />
              <span>Pending</span>
            </Link>
          </li>
          <li>
            <Link to="/nurse/assigned" className="menu-item">
              <FaCheckCircle className="menu-icon" />
              <span>Assigned</span>
            </Link>
          </li>
          <li>
            <Link to="/nurse/appointments" className="menu-item">
              <FaCalendarAlt className="menu-icon" />
              <span>Appointments</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
