import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Pharmacy/Sidebar";
import TopBar from "../Pharmacy/Topbar";

const PharmacyLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
    return (
      <div className={`pharmacy-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="pharmacy-main">
          <TopBar isSidebarOpen={isSidebarOpen} />
          <div className="pharmacy-content">
            <Outlet />
          </div>
        </div>
      </div>
    );
  };

export default PharmacyLayout;
