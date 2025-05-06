import React, { useState } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const ChatBox = ({ isChatOpen, toggleChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Hàm gửi tin nhắn cho bot
  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: inputMessage, sentBy: 'user' },
      { message: 'Bot reply here...', sentBy: 'bot' }, // Giả sử bot trả lời
    ]);
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
      <button
        onClick={toggleChat}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#f00',
          color: '#fff',
          padding: '5px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        X
      </button>
    </div>
  );
};

export default ChatBox;
