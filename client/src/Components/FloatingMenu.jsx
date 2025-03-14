import React from 'react';
import { Link } from 'react-router-dom'; 
import ChatBox from './ChatBox'; 

const FloatingMenu = () => {
  return (
    <div className="floating-menu">
      <Link to="/chat" className="floating-btn chat-btn">
        <i className="fas fa-comments"></i> 
        <span>Trợ lý</span> 
      </Link>

      <Link to="/booking" className="floating-btn booking-btn">
        <i className="fas fa-calendar-check"></i> 
        <span>Đặt lịch</span> 
      </Link>
    </div>
  );
};

export default FloatingMenu;
