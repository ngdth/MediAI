import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

const FloatingMenu = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      const newConversationId = uuidv4();
      setConversationId(newConversationId);
      console.log('Generated conversation_id:', newConversationId);
    }
  }, [conversationId]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const authToken = localStorage.getItem('token');
    const PAT = 'pat_7t4PE5vlYhqFxL16EjLlrn1hUPMhEesQ5TNbIGxN8cRNTExB1LJ2vBVdas3zLnsU';
    const userId = 'user_211';

    if (!conversationId) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Lỗi: Không thể khởi tạo hội thoại.' }]);
      return;
    }

    console.log('Sending to Coze API:', {
      bot_id: '7492844820491616264',
      user: userId,
      query: input,
      custom_variables: { token: authToken || '' },
      conversation_id: conversationId,
    });

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');

    try {
      const response = await fetch('https://api.coze.com/open_api/v2/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: '7492844820491616264',
          user: userId,
          query: input,
          stream: false,
          custom_variables: {
            token: authToken || '',
          },
          conversation_id: conversationId,
          chat_history: messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
            content_type: 'text',
          })),
        }),
      });

      const data = await response.json();
      console.log('Coze API response:', data);

      if (data.code === 0 && data.messages && data.messages.length > 0) {
        const botResponse = data.messages.find((msg) => msg.type === 'answer')?.content || 'Không có phản hồi từ bot.';
        setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      } else {
        throw new Error(data.msg || 'Lỗi khi gọi Coze API: Không nhận được phản hồi hợp lệ');
      }
    } catch (error) {
      console.error('Error calling Coze API:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: `Lỗi: ${error.message}` }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="floating-menu">
      <Link to="/BookingAppointments" className="floating-btn booking-btn">
        <i className="fas fa-calendar-check"></i>
        <span>Đặt lịch</span>
      </Link>
      <button className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? 'Đóng Chat' : 'Mở Chat'}
      </button>
      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">Chat với AMMA</div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span>{msg.sender === 'user' ? 'Bạn' : 'AMMA'}: {msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;