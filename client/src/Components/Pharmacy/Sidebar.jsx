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
            <Link to="/pharmacy/dashboard" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/pharmacy/pending" className="menu-item">
              <FaClipboard className="menu-icon" />
              <span>Pending</span>
            </Link>
          </li>
          <li>
            <Link to="/pharmacy/bills" className="menu-item">
              <FaCalendarAlt className="menu-icon" />
              <span>Bills</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
