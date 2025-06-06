import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../HeadOfDepartment/Sidebar";
import TopBar from "../HeadOfDepartment/Topbar";

const HODLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`admin-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="admin-main">
        <TopBar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HODLayout;
