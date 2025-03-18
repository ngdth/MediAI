import React from 'react';
import { Link } from 'react-router-dom';

const FloatingMenu = ({ onOpenChat }) => {
  return (
    <div className="floating-menu">
      {/* Nút trợ lý */}
      <button onClick={onOpenChat} className="floating-btn chat-btn">
        <i className="fas fa-comments"></i>
        <span>Trợ lý</span>
      </button>

      {/* Các nút khác */}
      <Link to="/booking" className="floating-btn booking-btn">
        <i className="fas fa-calendar-check"></i>
        <span>Đặt lịch</span>
      </Link>
    </div>
  );
};

export default FloatingMenu;
