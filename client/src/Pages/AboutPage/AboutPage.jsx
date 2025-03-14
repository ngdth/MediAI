import React, { useState, useEffect } from 'react';
import About from '../../Components/About';
import CtaSection1 from '../../Components/CtaSection.jsx/CtaSection1';
import CounterSection2 from '../../Components/FunSection/CounterSection2';
import PageHeading from '../../Components/PageHeading';
import Section from '../../Components/Section';
import TeamSection from '../../Components/TeamSection';
import axios from 'axios';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const headingData = {
  title: 'About Page',
};

const aboutData = {
  sectionSubtitle: 'OUR ABOUT US',
  sectionTitle: 'More Than 26+ Years About Provide Medical.',
  aboutText:
    'We are privileged to work with hundreds of future-thinking medial, including many of the world’s top hardware, software, and brands, feel safe and comfortable in establishing.',
  service:
    "There are many variations of pass available this medical service the team <a href='#''>READ MORE +</a>",
  experienceYears: '26+',
  experienceTitle: 'Experience',
  videoUrl: 'https://www.youtube.com/embed/rRid6GCJtgc',
  videoText: 'How We Work',
  iconboxes: [
    {
      imgUrl: '/assets/img/icons/about_icon_1.png',
      title: 'Client Support',
      subtitle: 'But must explain to you medical of and pain was.',
    },
    {
      imgUrl: '/assets/img/icons/about_icon_2.png',
      title: 'Doctor Support',
      subtitle: 'But must explain to you medical of and pain was.',
    },
  ],

  btnUrl: '/about',
  btnText: 'About More',
  sectionImgUrl: 'assets/img/about_section_img_1.png',
  headImgUrl: 'assets/img/about_img_7.jpeg',
};

const counterData = [
  {
    iconSrc: '/assets/img/icons/counter_icon_1.png',
    countTo: 567,
    suffix: '+',
    title: 'Active Clients',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_2.png',
    countTo: 23,
    suffix: 'K+',
    title: 'Team Support',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_3.png',
    countTo: 241,
    suffix: '+',
    title: 'Projects Completed',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_4.png',
    countTo: 16,
    suffix: 'K+',
    title: 'Award winner',
  },
];

const teamData = {
  subtitle: 'OUR TEAM MEMBER',
  title: ' Meet Our Specialist This <br />Doctor Meeting',
  sliderData: [
    {
      name: 'Dr. Norma Pedric',
      profession: 'Neurologist',
      imageUrl: '/assets/img/team_1.jpg',
      link: '/doctors/doctor-details',
      facebook: '/',
      pinterest: '/',
      twitter: '/',
      instagram: '/',
    },
    {
      name: 'Dr. James Lewis',
      profession: 'Neurologist',
      imageUrl: '/assets/img/team_3.jpg',
      link: '/doctors/doctor-details',
      facebook: '/',
      pinterest: '/',
      twitter: '/',
      instagram: '/',
    },
    {
      name: 'Dr. Sophia Anderson',
      profession: 'Neurologist',
      imageUrl: '/assets/img/team_4.jpg',
      link: '/doctors/doctor-details',
      facebook: '/',
      pinterest: '/',
      twitter: '/',
      instagram: '/',
    },
    {
      name: 'Dr. Michael Thompson',
      profession: 'Neurologist',
      imageUrl: 'assets/img/team_5.jpg',
      link: '/doctors/doctor-details',
      facebook: '/',
      pinterest: '/',
      twitter: '/',
      instagram: '/',
    },
    {
      name: 'Dr. David Wilson',
      profession: 'Neurologist',
      imageUrl: '/assets/img/team_6.jpg',
      link: '/doctors/doctor-details',
      facebook: '/',
      pinterest: '/',
      twitter: '/',
      instagram: '/',
    },
  ],
};

const ctaData = {
  videoLink: 'https://www.youtube.com/embed/rRid6GCJtgc',
  videoButtonText: 'WATCH VIDEO',
  subtitle: 'OUR WATCH VIDEO',
  title: 'Professional Medical Care Measure Medical.',
  description:
    'We are privileged to work with hundreds of future-thinking medial, including many of the world’s top hardware, software, and brands , feel safe and comfortable in establishing.',
  buttonLink: '/contact',
  buttonText: 'Video More',
  brandImage: 'assets/img/medical_brand.png',
};

const AboutPage = () => {
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
    <div className="about-page-area">
      {/* Các section hiện tại giữ nguyên */}
      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/aboutus.jpg"
      >
        <PageHeading data={headingData} />
      </Section>
      <Section
        topSpaceLg="70"
        topSpaceMd="120"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className={'cs_about cs_style_1 position-relative'}
      >
        <About data={aboutData} />
      </Section>
      <Section bottomSpaceLg="80" bottomSpaceMd="120" className="cs_counter_area_2">
        <CounterSection2 data={counterData} />
      </Section>
      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className={'cs_cta cs_style_2 cs_blue_bg cs_bg_filed cs_center'}
        backgroundImage="/assets/img/cta_bg_1.jpeg"
      >
        <CtaSection1 data={ctaData} />
      </Section>
      <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="0">
        <TeamSection hr={true} variant={'cs_pagination cs_style_2'} data={teamData} />
      </Section>

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
    </div>
  );
};

export default AboutPage;