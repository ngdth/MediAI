import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaUserMd, FaUserNurse, FaBars, FaTimes, FaPills } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="menu-list">
          <li>
            <Link to="/doctor/calendar" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Schedule Management</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor" className="menu-item">
              <FaUserMd className="menu-icon" />
              <span>Manage Appointments</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor/medical-result" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Medical Result</span>
            </Link>
          </li>
          <li>
            <Link to="/doctor/manage-prescriptions-record" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Prescriptions Record Result</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
