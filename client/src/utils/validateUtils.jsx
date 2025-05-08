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
  if (age === "") return "";
  if (age < 1) return 1;
  if (age > 120) return 120;
  return age;
};

export const validateExp = (exp) => {
  if (typeof exp === "string" && exp.length > 1 && exp.startsWith("0")) {
    exp = exp.slice(1);
    return exp;
  }
  if (exp < 0) return 0;
  if (exp > 99) return 99;
  return exp;
};

export const validateQuantity = (quantity) => {
  if (!quantity.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  if (!/^\d+$/.test(quantity)) {
    return { isValid: false, message: "Số lượng chỉ được chứa các chữ số!" };
  }
  const parsedQuantity = parseInt(quantity, 10);
  if (parsedQuantity > 999) {
    return { isValid: false, message: "Số lượng không được vượt quá 999!" };
  }
  return { isValid: true, message: "" };
};

export const validateMedicineName = (medicineName) => {
  if (!medicineName.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  if (medicineName.length > 100) {
    return { isValid: false, message: "Tên thuốc không được vượt quá 100 ký tự!" };
  }
  return { isValid: true, message: "" };
};

export const validateUnit = (unit) => {
  if (!unit.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  if (unit.length > 50) {
    return { isValid: false, message: "Đơn vị không được vượt quá 50 ký tự!" };
  }
  return { isValid: true, message: "" };
};

export const validateUsage = (usage) => {
  if (!usage.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  if (usage.length > 100) {
    return { isValid: false, message: "Cách dùng không được vượt quá 100 ký tự!" };
  }
  return { isValid: true, message: "" };
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

export const validateUsername = (username) => {
  if (!username) return true;
  return /^[a-zA-Z\s\u00C0-\u1EF9]{2,50}$/.test(username);
};

export const validateGender = (gender) => {
  if (!gender) return true;
  return ["Nam", "Nữ"].includes(gender);
};

export const validateAddress = (address) => {
  if (!address) return true;
  return address.length <= 100;
};

export const validateCity = (city) => {
  if (!city) return true;
  return city.length <= 50;
};

export const validateCountry = (country) => {
  if (!country) return true;
  return country.length <= 50;
};

export const validateBio = (bio) => {
  if (!bio) return true;
  return bio.length <= 1000;
};

export const validatePassword = (password) => {
  if (!password.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{6,24}$/;
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: "Mật khẩu phải dài 6-24 ký tự, bao gồm chữ cái, số, ít nhất 1 chữ in hoa.",
    };
  }
  return { isValid: true, message: "" };
};

export const validateConfirmedPassword = (password, confirmedPassword) => {
  if (!confirmedPassword.trim()) {
    return { isValid: false, message: "Không được để trống!" };
  }
  if (password !== confirmedPassword) {
    return { isValid: false, message: "Mật khẩu xác nhận không khớp." };
  }
  return { isValid: true, message: "" };
};