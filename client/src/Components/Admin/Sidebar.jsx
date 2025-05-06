import React from "react";
import { Link } from "react-router-dom";
import { FaBars, FaClipboard, FaHospital, FaTachometerAlt, FaTimes, FaUser, FaUserMd, FaUserNurse } from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="menu-list">
          <li>
            <Link to="/admin" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className="menu-item">
              <FaUser className="menu-icon" />
              <span>Quản Lý Người dùng </span>
            </Link>
          </li>
          <li>
            <Link to="/admin/headofdepartments" className="menu-item">
              <FaUserMd className="menu-icon" />
              <span>Quản Lý Trưởng Khoa </span>
            </Link>
          </li>
          <li>
            <Link to="/admin/doctors" className="menu-item">
              <FaUserMd className="menu-icon" />
              <span>Quản Lý Bác Sĩ </span>
            </Link>
          </li>
          <li>
            <Link to="/admin/nurses" className="menu-item">
              <FaUserNurse className="menu-icon" />
              <span>Quản Lý Y Tá </span>
            </Link>
          </li>
          <li>
            <Link to="/admin/pharmacy" className="menu-item">
              <FaHospital className="menu-icon" />
              <span>Quản Lý Nhà Thuốc</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/services" className="menu-item">
              <FaClipboard className="menu-icon" />
              <span>Quản lí dịch vụ khám</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
