import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Nurse/Sidebar";
import TopBar from "../Nurse/Topbar";

const NurseLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
    return (
      <div className={`nurse-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="nurse-main">
          <TopBar isSidebarOpen={isSidebarOpen} />
          <div className="nurse-content">
            <Outlet />
          </div>
        </div>
      </div>
    );
  };

export default NurseLayout;
