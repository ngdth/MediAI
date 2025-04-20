import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";

const ProfileForm = ({ user, setUser }) => {
    const [isFormChanged, setIsFormChanged] = useState(false);
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
        phone: user?.phone || "",
        bio: user?.bio || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                birthday: user.birthday ? new Date(user.birthday) : null,
                gender: user.gender || "",
                address: user.address || "",
                city: user.city || "",
                country: user.country || "",
                phone: user.phone || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => {
            const updatedData = { ...prevState, [name]: value };
            setIsFormChanged(true);
            return updatedData;
        });
    };

    const handleDateChange = (date) => {
        setFormData((prevState) => ({
            ...prevState,
            birthday: date,
        }));
        setIsFormChanged(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You must be logged in to update your profile");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/user/updateProfile/${user._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                toast.success("Profile updated successfully!");
                localStorage.setItem("username", formData.username);
                const updatedUserResponse = await axios.get("http://localhost:8080/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(updatedUserResponse.data.user);
                setIsFormChanged(false);
                setTimeout(() => {
                    window.location.reload();
                }, 6000);
            }
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
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
                            />
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
                            />
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
                            <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <hr className="my-3" />

                {/* <h6 className="heading-small text-muted mb-4">Liên hệ</h6> */}
                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
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
                            />
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
                            />
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
                            />
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
                            />
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
