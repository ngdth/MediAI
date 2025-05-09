import React, { useEffect, useState } from "react";
import ProfileForm from "../../Components/Form/ProfileForm/ProfileForm";
import { toast } from "react-toastify";
import { Container, Col, Row, Button, Modal, Form } from "react-bootstrap";
import { FaRegEdit } from "react-icons/fa";
import axios from "axios";
import { validatePassword, validateConfirmedPassword } from "../../utils/validateUtils";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confPassword: "",
    });
    const [fieldErrors, setFieldErrors] = useState({
        oldPassword: "",
        newPassword: "",
        confPassword: "",
    });
    const [hover, setHover] = useState(false);

    const fetchUserInfo = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Please login first.");
            toast.error("Vui lòng đăng nhập trước.");
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data.user);
        } catch (err) {
            console.error("Failed to fetch user info", err);
            toast.error("Lỗi khi tải thông tin người dùng");
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleChangePassClick = () => {
        setShowModal(true);
        setPasswordData({ oldPassword: "", newPassword: "", confPassword: "" });
        setFieldErrors({ oldPassword: "", newPassword: "", confPassword: "" });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: "" }));

        // Real-time validation
        if (name === "newPassword" && value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                setFieldErrors(prev => ({ ...prev, newPassword: validation.message }));
            }
        }
        if (name === "confPassword" && value) {
            const validation = validateConfirmedPassword(passwordData.newPassword, value);
            if (!validation.isValid) {
                setFieldErrors(prev => ({ ...prev, confPassword: validation.message }));
            }
        }
    };

    const handlePasswordSubmit = async () => {
        setFieldErrors({
            oldPassword: "",
            newPassword: "",
            confPassword: "",
        });

        // Check for empty required fields
        const newFieldErrors = {
            oldPassword: !passwordData.oldPassword ? "Không được để trống!" : "",
            newPassword: !passwordData.newPassword ? "Không được để trống!" : "",
            confPassword: !passwordData.confPassword ? "Không được để trống!" : "",
        };
        const hasEmptyFields = Object.values(newFieldErrors).some(error => error);
        if (hasEmptyFields) {
            toast.error("Hãy sửa tất cả các lỗi trước khi đổi mật khẩu");
            setFieldErrors(newFieldErrors);
            return;
        }

        // Validate fields
        const passwordValidation = validatePassword(passwordData.newPassword);
        const confPasswordValidation = validateConfirmedPassword(passwordData.newPassword, passwordData.confPassword);

        if (!passwordValidation.isValid) {
            newFieldErrors.newPassword = passwordValidation.message;
        }
        if (!confPasswordValidation.isValid) {
            newFieldErrors.confPassword = confPasswordValidation.message;
        }

        const hasValidationErrors = Object.values(newFieldErrors).some(error => error);
        if (hasValidationErrors) {
            toast.error("Hãy sửa tất cả các lỗi trước khi đổi mật khẩu");
            setFieldErrors(newFieldErrors);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Bạn phải đăng nhập để đổi mật khẩu");
            return;
        }
        try {
            await axios.post(`${import.meta.env.VITE_BE_URL}/user/changePassword/${user?._id}`, passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Đổi mật khẩu thành công!");
            setShowModal(false);
            setPasswordData({ oldPassword: "", newPassword: "", confPassword: "" });
        } catch (error) {
            console.error("Error changing password", error);
            toast.error("Lỗi khi đổi mật khẩu. Vui lòng thử lại.");
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Hiển thị ảnh trước khi gửi request
        const previewUrl = URL.createObjectURL(file);
        setUser((prevUser) => ({ ...prevUser, imageUrl: previewUrl }));
    
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận các định dạng ảnh JPG, JPEG, PNG");
            return;
        }
    
        if (file.size > 2 * 1024 * 1024) { // 2MB giới hạn
            toast.error("Ảnh không được vượt quá 2MB");
            return;
        }
    
        const formData = new FormData();
        formData.append("avatar", file);
    
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_BE_URL}/user/update-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
    
            setUser((prevUser) => ({ ...prevUser, imageUrl: response.data.imageUrl }));
            toast.success("Tải lên ảnh đại diện thành công!");
        } catch (error) {
            toast.error("Lỗi khi cập nhật ảnh đại diện");
        }
    };

    return (
        <>
            <div className="cs_site_header_spacing_100"></div>
            <Container fluid className="p-0">
                <Row className="header pb-8 pt-5 pt-lg-8 align-items-center cs_blue_bg"
                    style={{
                        minHeight: "250px",
                        backgroundSize: "cover",
                        backgroundPosition: "center 35%",
                    }}
                >
                    <Col md={12} className="text-center">
                        <h1 className="display-4 fw-bold text-white" style={{ marginTop: "-7rem"}}>
                            Xin chào {user?.username || "Null"}
                        </h1>
                    </Col>
                </Row>
    
                <Container style={{ marginTop: "-6rem" }}>
                    <Row>
                        <Col xl={4} className="order-xl-2 mb-5 mb-xl-0">
                            <div className="card card-profile shadow">
                                <div className="row justify-content-center">
                                    <Col lg={3} className="order-lg-2 d-flex justify-content-center">
                                        <div className="card-profile-image-container"
                                            onMouseEnter={() => setHover(true)}
                                            onMouseLeave={() => setHover(false)}
                                            onClick={() => document.getElementById("upload-avatar").click()}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <img
                                                src={user?.imageUrl || "https://i.pinimg.com/736x/16/b2/e2/16b2e2579118bf6fba3b56523583117f.jpg"}
                                                alt="User"
                                                className="circle-image"
                                                style={{ 
                                                    marginTop: "2rem",
                                                    filter: hover? "brightness(0.5)": "brightness(1)",
                                                }}
                                            />
                                            <input type="file" id="upload-avatar" accept="image/*" onChange={handleImageChange} style={{ display: "none", marginTop: "2rem" }} />
                                            {hover && <FaRegEdit className="edit-icon" style={{ marginTop: "1rem", position: "absolute" }} />}
                                        </div>
                                    </Col>
                                </div>
    
                                <div className="card-body pt-0 pt-md-4 text-center">
                                    <h3>{user?.username ? `${user?.username}` : ''}</h3>
                                    <div className="h5 font-weight-300">
                                        <i className="ni location_pin mr-2"></i>
                                        {user?.city && user?.country ? `${user?.city}, ${user?.country}` : "Đà Nẵng, Việt Nam"}
                                    </div>
                                    <hr className="my-4" />
                                    <div>
                                        <i className="mr-2"></i>
                                        {user?.phone || "+84 012 345 678"}
                                    </div>
                                </div>
                            </div>
                        </Col>
    
                        <Col xl={8} className="order-xl-1">
                            <div className="card shadow">
                                <div className="card-header bg-white border-0 py-3">
                                    <Row className="align-items-center mb-4">
                                        <Col xs={8} className="ps-4">
                                            <h3 className="mb-0">Thông tin của tôi</h3>
                                        </Col>
                                        <Col xs={4} className="d-flex justify-content-end pe-5">
                                            {!user?.googleId && (
                                                <Button className="cs_btn cs_style_1 cs_color_1" onClick={handleChangePassClick}>
                                                    Đổi mật khẩu
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                    <ProfileForm user={user} setUser={setUser} />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Container>
    
            <div className="cs_site_header_spacing_100"></div>
            {showModal && <div className="modal-overlay"></div>}
            
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate>
                        <Form.Group controlId="oldPassword" className="mb-3">
                            <Form.Label className="d-block text-start">Mật khẩu cũ</Form.Label>
                            <Form.Control
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!fieldErrors.oldPassword}
                                required
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.oldPassword}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="newPassword" className="mb-3">
                            <Form.Label className="d-block text-start">Mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!fieldErrors.newPassword}
                                required
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.newPassword}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="confPassword" className="mb-3">
                            <Form.Label className="d-block text-start">Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                name="confPassword"
                                value={passwordData.confPassword}
                                onChange={handlePasswordChange}
                                isInvalid={!!fieldErrors.confPassword}
                                required
                            />
                            <Form.Control.Feedback type="invalid">{fieldErrors.confPassword}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                    <Button variant="primary" onClick={handlePasswordSubmit}>Cập nhật</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserProfile;