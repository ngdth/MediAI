import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserMd,
  FaUserNurse,
  FaBars,
  FaTimes,
  FaPills,
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="menu-list">
          <li>
            <Link to="/hod/calendar" className="menu-item">
              <FaTachometerAlt className="menu-icon" />
              <span>Quản lý lịch khám </span>
            </Link>
          </li>
          <li>
            <Link to="/hod" className="menu-item">
              <FaUserMd className="menu-icon" />
              <span>Quản lý lịch hẹn</span>
            </Link>
          </li>
          <li>
            <Link to="/hod/medical-result" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Quản lý kết quả khám</span>
            </Link>
          </li>
          <li>
            <Link to="/hod/manage-prescription-result" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Quản lý đơn thuốc</span>
            </Link>
          </li>
          <li>
            <Link to="/hod/medical-history" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Lịch sử khám bệnh</span>
            </Link>
          </li>
          <li>
            <Link to="/hod/specialization" className="menu-item">
              <FaPills className="menu-icon" />
              <span>Lịch sử khám bệnh các bác sĩ</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
