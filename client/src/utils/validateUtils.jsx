import { toast } from "react-toastify";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return regex.test(phone);
};

export const validateAge = (age) => {
  const parsedAge = parseInt(age, 10);
  if (isNaN(parsedAge)) return "";
  if (parsedAge < 1) return 1;
  if (parsedAge > 120) return 120;

  return parsedAge;
};

export const checkAuth = (callback, navigate) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Vui lòng đăng nhập để tiếp tục");
    navigate("/login");
    return;
  }
  callback();
};

export const validateBookingForm = ({ formData, selectedDay, selectedSlot }) => {
  if (!formData.fullName || !formData.age || !formData.gender || !formData.address || !formData.email || !formData.phone || !formData.symptoms) {
    return { isValid: false, message: "Vui lòng điền đầy đủ thông tin!" };
  }
  if (!selectedDay || !selectedSlot) {
    return { isValid: false, message: "Vui lòng chọn ngày và giờ khám!" };
  }
  return { isValid: true };
};
