import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUserMd, FaUserNurse, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="menu-list">
          <li>
            <Link to="/doctor" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor/doctors" className="menu-item">
              <FaUserMd className="menu-icon" />
              <span>Doctor Management</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor/nurses" className="menu-item">
              <FaUserNurse className="menu-icon" />
              <span>Nurse Management</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
