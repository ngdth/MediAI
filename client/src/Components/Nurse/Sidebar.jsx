import React from "react";
import { NavLink } from "react-router-dom";
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
            <NavLink 
              to="/nurse/dashboard" 
              className="menu-item"
              activeClassName="active"
            >
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/nurse/pending" 
              className="menu-item"
              activeClassName="active"
            >
              <FaClipboard className="menu-icon" />
              <span>Lịch hẹn chờ phân công</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/nurse/assigned" 
              className="menu-item"
              activeClassName="active"
            >
              <FaCheckCircle className="menu-icon" />
              <span>Lịch hẹn chờ xác nhận</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/nurse/appointments" 
              className="menu-item"
              activeClassName="active"
            >
              <FaCalendarAlt className="menu-icon" />
              <span>Danh sách lịch hẹn</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
