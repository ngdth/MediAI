import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const FloatingMenu = () => {
  const chatClientRef = useRef(null);

  useEffect(() => {
    // Lấy token từ localStorage
    const authToken = localStorage.getItem('token');

    // Kiểm tra xem CozeWebSDK đã được tải chưa
    if (typeof CozeWebSDK !== 'undefined') {
      // Khởi tạo Coze ChatSDK
      chatClientRef.current = new CozeWebSDK.WebChatClient({
        config: {
          bot_id: '7492844820491616264', // Bot ID từ Coze
        },
        componentProps: {
          title: 'Chat với AMMA', // Tiêu đề khung chat
          layout: 'desktop', // Hoặc 'mobile' tùy thuộc vào thiết bị
          position: 'bottom-right', // Vị trí nút nổi
          width: '350px', // Chiều rộng khung chat
          height: '500px', // Chiều cao khung chat
          buttonIcon: '💬', // Icon cho nút nổi (có thể thay bằng URL hình ảnh)
        },
        customVariables: {
          token: authToken || '', // Truyền token vào customVariables để sử dụng trong plugin
        },
        auth: {
          type: 'token',
          token: 'pat_7t4PE5vlYhqFxL16EjLlrn1hUPMhEesQ5TNbIGxN8cRNTExB1LJ2vBVdas3zLnsU', // PAT của bạn (cần để gọi API Coze)
          onRefreshToken: function () {
            // Logic làm mới token nếu cần
            return 'pat_7t4PE5vlYhqFxL16EjLlrn1hUPMhEesQ5TNbIGxN8cRNTExB1LJ2vBVdas3zLnsU';
          },
        },
      });

      // Cleanup: Hủy ChatSDK khi component bị unmount
      return () => {
        if (chatClientRef.current) {
          chatClientRef.current.destroy();
        }
      };
    } else {
      console.error('CozeWebSDK không được tải. Vui lòng kiểm tra script nhúng.');
    }
  }, []);

  return (
    <div className="floating-menu">
      {/* Giữ lại nút Đặt lịch */}
      {/* <Link to="/BookingAppointments" className="floating-btn booking-btn">
        <i className="fas fa-calendar-check"></i>
        <span>Đặt lịch</span>
      </Link> */}
    </div>
  );
};

export default FloatingMenu;