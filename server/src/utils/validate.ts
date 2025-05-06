// Các regex và hằng số để xác thực
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z\s\u00C0-\u1EF9]{2,50}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{6,24}$/;
const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
const CODE_REGEX = /^\d{6}$/;

export const validateEmail = (email: string | undefined): string | null => {
    if (!email) return null; // Không kiểm tra bắt buộc
    return EMAIL_REGEX.test(email) ? null : "Vui lòng nhập địa chỉ email hợp lệ.";
};

export const validateUsername = (username: string | undefined): string | null => {
    if (!username) return null; // Không kiểm tra bắt buộc
    return USERNAME_REGEX.test(username)
        ? null
        : "Tên người dùng chỉ được chứa chữ cái và khoảng trắng, từ 2-50 ký tự.";
};

export const validatePassword = (password: string | undefined): string | null => {
    if (!password) return null; // Không kiểm tra bắt buộc
    return PASSWORD_REGEX.test(password)
        ? null
        : "Mật khẩu phải từ 6-24 ký tự, bao gồm chữ cái, số, ít nhất một chữ cái in hoa.";
};

export const validatePhone = (phone: string | undefined): string | null => {
    if (!phone) return null; // Phone là tùy chọn
    return PHONE_REGEX.test(phone) ? null : "Vui lòng nhập số điện thoại hợp lệ.";
};

export const validateGender = (gender: string | undefined): string | null => {
    if (!gender) return null; // Không kiểm tra bắt buộc
    return ["Nam", "Nữ"].includes(gender) ? null : "Giới tính phải là 'Nam' hoặc 'Nữ'.";
};

export const validateCode = (code: string | undefined): string | null => {
    if (!code) return null; // Không kiểm tra bắt buộc
    return CODE_REGEX.test(code) ? null : "Mã xác thực phải là 6 chữ số.";
};

export const validateBirthday = (birthday: string | Date | null | undefined): string | null => {
    if (birthday === null || birthday === undefined) return null; // Cho phép null
    const date = new Date(birthday);
    return !isNaN(date.getTime()) ? null : "Ngày sinh phải là ngày hợp lệ.";
};

export const validateAddress = (address: string | undefined): string | null => {
    if (!address) return null; // Address là tùy chọn
    return address.length <= 100 ? null : "Địa chỉ không được vượt quá 100 ký tự.";
};

export const validateCity = (city: string | undefined): string | null => {
    if (!city) return null; // City là tùy chọn
    return city.length <= 50 ? null : "Thành phố không được vượt quá 50 ký tự.";
};

export const validateCountry = (country: string | undefined): string | null => {
    if (!country) return null; // Country là tùy chọn
    return country.length <= 50 ? null : "Quốc gia không được vượt quá 50 ký tự.";
};

export const validateBio = (bio: string | undefined): string | null => {
    if (!bio) return null; // Bio là tùy chọn
    return bio.length <= 1000 ? null : "Tiểu sử không được vượt quá 1000 ký tự.";
};

export const validateConfPassword = (
    newPassword: string | undefined,
    confPassword: string | undefined
): string | null => {
    if (!confPassword) return null; // Không kiểm tra bắt buộc
    return newPassword === confPassword ? null : "Xác nhận mật khẩu phải trùng với mật khẩu mới.";
};

export const validateFields = (fields: {
    [key: string]: { value: any; validator: (value: any) => string | null };
}): string[] => {
    const errors: string[] = [];
    for (const [field, { value, validator }] of Object.entries(fields)) {
        const error = validator(value);
        if (error) errors.push(error);
    }
    return errors;
};