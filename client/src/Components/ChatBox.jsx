
import React, { useState } from 'react';


const ChatBox = ({ isOpen, closeChat }) => {
  if (!isOpen) return null;

  return (
    <div className="chat-box-overlay">
      <div className="chat-box">
        <button className="close-chat-btn" onClick={closeChat}>
          X
        </button>
        <div className="chat-header">
          <h3>Trợ lý</h3>
        </div>
        <div className="chat-content">
          <p>Chào bạn! Tôi có thể giúp gì cho bạn?</p>
          <input type="text" placeholder="Nhập tin nhắn..." />
          <button>Gửi</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
