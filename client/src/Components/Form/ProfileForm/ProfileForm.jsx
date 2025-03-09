import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const ProfileForm = ({ user, onFormChange, isFormChanged }) => {
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        birthday: user?.birthday || "",
        gender: user?.gender || "",
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                birthday: user.birthday || "",
                gender: user.gender || "",
                address: user.address || "",
                city: user.city || "",
                country: user.country || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => {
            const updatedData = { ...prevState, [name]: value };
            onFormChange(); // Thông báo khi có thay đổi
            return updatedData;
        });
    };

    // Handle submit form and call API to update user profile
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) {
            alert("You must be logged in to update your profile");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/user/updateProfile/${user._id}`, // Your API endpoint to update user profile
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in the Authorization header
                    },
                }
            );
            if (response.status === 200) {
                alert("Profile updated successfully");
                // Optional: You can call `onFormChange(false)` here to reset the form change state.
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    if (!user) {
        return <div className="danger">Cannot fetch user data!!!</div>; // Loading message when user data is not available
    }

    return (
        <div className="card-body" style={{ backgroundColor: "#F7FAFC" }}>
            <Form onSubmit={handleSubmit}>
                {/* Thông tin cơ bản */}
                <h6 className="heading-small text-muted mb-4 ps-4">Thông tin cơ bản</h6>
                <div className="pl-lg-4 ps-5">
                    <div className="row mb-3">
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-username">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    id="input-username"
                                    className="form-control form-control-alternative"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="form-group">
                                <label className="form-control-label" htmlFor="input-email">
                                    Địa chỉ email
                                </label>
                                <input
                                    type="email"
                                    id="input-email"
                                    className="form-control form-control-alternative"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-first-name">
                                    Họ
                                </label>
                                <input
                                    type="text"
                                    id="input-first-name"
                                    className="form-control form-control-alternative"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-last-name">
                                    Tên
                                </label>
                                <input
                                    type="text"
                                    id="input-last-name"
                                    className="form-control form-control-alternative"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row pb-3">
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-birthday">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    id="input-birthday"
                                    className="form-control form-control-alternative"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-gender">
                                    Giới tính
                                </label>
                                <select
                                    id="input-gender"
                                    className="form-control form-control-alternative mySelect"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-4" />

                {/* Liên hệ */}
                <h6 className="heading-small text-muted mb-4 ps-4">Liên hệ</h6>
                <div className="pl-lg-4 ps-5">
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-address">
                                    Địa chỉ
                                </label>
                                <input
                                    id="input-address"
                                    className="form-control form-control-alternative"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-city">
                                    Thành phố
                                </label>
                                <input
                                    type="text"
                                    id="input-city"
                                    className="form-control form-control-alternative"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="form-group focused">
                                <label className="form-control-label" htmlFor="input-country">
                                    Quốc Gia
                                </label>
                                <input
                                    type="text"
                                    id="input-country"
                                    className="form-control form-control-alternative"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="form-group focused">
                            <label className="form-control-label" htmlFor="input-tel">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                id="input-tel"
                                className="form-control form-control-alternative"
                                name="tel"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Button Cập nhật */}
                <div className="text-end mt-4 pe-4">
                    <Button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isFormChanged} // Disable button if no form changes
                    >
                        Cập nhật thông tin
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ProfileForm;
