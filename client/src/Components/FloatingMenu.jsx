import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const FloatingMenu = ({ onOpenChat }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Sử dụng thông tin từ Postman
  const COZE_API_KEY = 'pat_VcSiKPkr6OBZgzsOBLPA1rovVbl7wnr2U7KA2P6FUZKLDLq6824V47Pj2a1tdT9B';
  const COZE_BOT_ID = '7444226106657800210';
  const COZE_API_BASE = '/coze-api/open_api/v1/chat'; // Proxy đã cấu hình trong vite.config.js

  const sendMessageToCoze = async (message) => {
    try {
      const response = await axios.post(
        COZE_API_BASE,
        {
          bot_id: COZE_BOT_ID,
          user: '1234',
          query: message,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${COZE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Phản hồi từ Coze API:', response.data);

      // Xử lý phản hồi dạng streaming
      let apiData;
      if (typeof response.data === 'string') {
        // Tách phần "data:" và phân tích cú pháp JSON
        const dataString = response.data.split('data:')[1]?.trim();
        if (dataString) {
          apiData = JSON.parse(dataString);
        } else {
          throw new Error('Không thể phân tích dữ liệu từ phản hồi API');
        }
      } else {
        apiData = response.data; // Nếu phản hồi đã là JSON
      }

      // Kiểm tra phản hồi từ API
      if (apiData.code === 0) {
        if (apiData.messages) {
          // Lọc tin nhắn có type: "answer" từ bot
          const botMessages = apiData.messages.filter(
            (msg) => msg.role === 'assistant' && msg.type === 'answer'
          );
          const botReply = botMessages.length > 0
            ? botMessages[0].content
            : 'Bot không trả lời nội dung nào.';

          setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, sentBy: 'user' },
            { message: botReply, sentBy: 'bot' },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, sentBy: 'user' },
            { message: 'Không có tin nhắn từ bot trong phản hồi.', sentBy: 'bot' },
          ]);
        }
      } else {
        const errorMessage = apiData.msg || 'Phản hồi không hợp lệ từ Coze API';
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: message, sentBy: 'user' },
          { message: `Lỗi từ API: ${errorMessage}`, sentBy: 'bot' },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn tới Coze API:', error);
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại.';
      if (error.response) {
        errorMessage = `Lỗi từ máy chủ: ${error.response.status} - ${error.response.data.msg || 'Không rõ chi tiết'}`;
      } else if (error.request) {
        errorMessage = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc cấu hình proxy.';
      } else {
        errorMessage = `Lỗi xử lý: ${error.message}`;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: message, sentBy: 'user' },
        { message: errorMessage, sentBy: 'bot' },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    sendMessageToCoze(inputMessage);
    setInputMessage('');
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '300px',
    height: '400px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: isChatOpen ? 'block' : 'none',
  };

  return (
    <div className="floating-menu">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1001,
        }}
      >
        {isChatOpen ? 'Đóng Chat' : 'Chat với Bot'}
      </button>

      <div style={chatWindowStyle}>
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  model={{
                    message: msg.message,
                    sentTime: new Date().toLocaleTimeString(),
                    sender: msg.sentBy,
                    direction: msg.sentBy === 'user' ? 'outgoing' : 'incoming',
                  }}
                />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(val) => setInputMessage(val)}
              onSend={handleSendMessage}
            />
          </ChatContainer>
        </MainContainer>
      </div>

      <button onClick={onOpenChat} className="floating-btn chat-btn">
        <i className="fas fa-comments"></i>
        <span>Trợ lý</span>
      </button>

      <Link to="/BookingAppointments" className="floating-btn booking-btn">
        <i className="fas fa-calendar-check"></i>
        <span>Đặt lịch</span>
      </Link>
    </div>
  );
};

export default FloatingMenu;
