import React, { useEffect, useState } from "react";
import ProfileForm from "../../Components/Form/ProfileForm/ProfileForm";
import { toast } from "react-toastify";
import {Container,Col, Row, Button, Modal, Form } from "react-bootstrap";
import { FaRegEdit } from "react-icons/fa";
import axios from "axios";

const StaffProfile = () => {
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confPassword: "",
    });
    const [hover, setHover] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Please login first.");
                toast.error("Không tìm thấy token. Vui lòng đăng nhập trước.");
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data.user);
                toast.success("Tải thông tin người dùng thành công!");
            } catch (err) {
                console.error("Failed to fetch user info", err);
                toast.error("Lỗi khi tải thông tin người dùng");
            }
        };

        fetchUserInfo();
        
    }, []);

    const handleChangePassClick = () => {
        setShowModal(true);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confPassword) {
            toast.error("Mật khẩu mới và xác nhận không khớp");
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
            <Container fluid className="p-0">
                <Container>
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
                            {(user?.role === "doctor" || user?.role === "nurse" || user?.role === "head of department") && (
                                <div className="card mt-4 shadow">
                                    <div className="card-body text-center">
                                        <h4 className="font-weight-bold">Thông tin chuyên môn</h4>
                                        <p><strong>Khoa:</strong> {user?.specialization || "Chưa cập nhật"}</p>
                                        <p><strong>Kinh nghiệm:</strong> {user?.experience || 0} năm</p>
                                    </div>
                                </div>
                            )}
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
                    <Form>
                        <Form.Group>
                            <Form.Label className="d-block text-start">Mật khẩu cũ</Form.Label>
                            <Form.Control type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="d-block text-start">Mật khẩu mới</Form.Label>
                            <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="d-block text-start">Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control type="password" name="confPassword" value={passwordData.confPassword} onChange={handlePasswordChange}/>
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

export default StaffProfile;