import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { validateUsername, validateEmail, validatePhone, validateGender, validateAddress, validateCity, validateCountry, validateBio } from "../../../utils/validateUtils";

const ProfileForm = ({ user, setUser }) => {
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        birthday: user?.birthday || null,
        gender: user?.gender || "",
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
    });
    const [errors, setErrors] = useState({});
    
    const ERROR_MESSAGES = {
        username: "Tên chỉ được chứa chữ cái và khoảng trắng (2-50 ký tự)",
        email: "Vui lòng nhập địa chỉ email hợp lệ",
        phone: "Vui lòng nhập số điện thoại hợp lệ",
        gender: "Giới tính phải là 'Nam' hoặc 'Nữ'",
        address: "Địa chỉ không được vượt quá 100 ký tự",
        city: "Thành phố không được vượt quá 50 ký tự",
        country: "Quốc gia không được vượt quá 50 ký tự",
        bio: "Tiểu sử không được vượt quá 1000 ký tự"
    };

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                birthday: user.birthday ? new Date(user.birthday) : null,
                gender: user.gender || "",
                address: user.address || "",
                city: user.city || "",
                country: user.country || "",
                phone: user.phone || "",
                bio: user.bio || "",
            });
            setErrors({});
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setIsFormChanged(true);

        const newErrors = { ...errors };
        switch (name) {
            case 'username':
                newErrors.username = !validateUsername(value) ? ERROR_MESSAGES.username : "";
                break;
            case 'email':
                newErrors.email = !validateEmail(value) ? ERROR_MESSAGES.email : "";
                break;
            case 'phone':
                newErrors.phone = !validatePhone(value) ? ERROR_MESSAGES.phone : "";
                break;
            case 'gender':
                newErrors.gender = !validateGender(value) ? ERROR_MESSAGES.gender : "";
                break;
            case 'address':
                newErrors.address = !validateAddress(value) ? ERROR_MESSAGES.address : "";
                break;
            case 'city':
                newErrors.city = !validateCity(value) ? ERROR_MESSAGES.city : "";
                break;
            case 'country':
                newErrors.country = !validateCountry(value) ? ERROR_MESSAGES.country : "";
                break;
            case 'bio':
                newErrors.bio = !validateBio(value) ? ERROR_MESSAGES.bio : "";
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const handleDateChange = (date) => {
        setFormData((prevState) => ({
            ...prevState,
            birthday: date,
        }));
        setIsFormChanged(true);
    };

    const capitalizeName = (name) => {
        return name
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Bạn phải đăng nhập để cập nhật hồ sơ");
            return;
        }

        // Validate form data
        const newErrors = {};
        if (!validateUsername(formData.username)) newErrors.username = ERROR_MESSAGES.username;
        if (!validateEmail(formData.email)) newErrors.email = ERROR_MESSAGES.email;
        if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = ERROR_MESSAGES.phone;
        if (formData.gender && !validateGender(formData.gender)) newErrors.gender = ERROR_MESSAGES.gender;
        if (formData.address && !validateAddress(formData.address)) newErrors.address = ERROR_MESSAGES.address;
        if (formData.city && !validateCity(formData.city)) newErrors.city = ERROR_MESSAGES.city;
        if (formData.country && !validateCountry(formData.country)) newErrors.country = ERROR_MESSAGES.country;
        if (formData.bio && !validateBio(formData.bio)) newErrors.bio = ERROR_MESSAGES.bio;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Vui lòng sửa các lỗi trong biểu mẫu");
            return;
        }

        // Chuẩn hóa tên và chuẩn bị dữ liệu gửi đi
        const submissionData = {
            ...formData,
            username: formData.username ? capitalizeName(formData.username) : formData.username,
            birthday: formData.birthday ? formData.birthday.toISOString() : undefined,
        };

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BE_URL}/user/updateProfile/${user._id}`,
                submissionData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                toast.success("Cập nhật hồ sơ thành công!");
                localStorage.setItem("username", submissionData.username);
                const updatedUserResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(updatedUserResponse.data.user);
                setIsFormChanged(false);
                setTimeout(() => {
                    window.location.reload();
                }, 6000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
            toast.error(errorMessage);
        }
    };

    if (!user) return <div></div>;

    return (
        <Container className="card-body p-4" style={{ backgroundColor: "#F7FAFC" }}>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                isInvalid={!!errors.username}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Địa chỉ email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Ngày sinh</Form.Label>
                            <DatePicker
                                selected={formData.birthday}
                                onChange={handleDateChange}
                                dateFormat="dd-MM-yyyy"
                                className="form-control"
                                placeholderText="dd-mm-yyyy"
                                maxDate={new Date()}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                isInvalid={!!errors.gender}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.gender}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <hr className="my-3" />

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                isInvalid={!!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.address}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Thành phố</Form.Label>
                            <Form.Control
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                isInvalid={!!errors.city}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.city}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Quốc gia</Form.Label>
                            <Form.Control
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                isInvalid={!!errors.country}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.country}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Form.Group>
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {["nurse", "doctor", "head of department"].includes(user.role) && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>Bio</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    isInvalid={!!errors.bio}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.bio}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <div className="text-end">
                    <Button type="submit" className="cs_btn cs_style_1 cs_color_1" disabled={!isFormChanged}>
                        Cập nhật thông tin
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default ProfileForm;