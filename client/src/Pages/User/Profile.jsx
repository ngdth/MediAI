import React, { useEffect, useState } from "react";
import ProfileForm from "../../components/Form/ProfileForm/ProfileForm"; // Import form vào
import { Button } from "react-bootstrap";
import axios from "axios"; // Thêm axios để gọi API

const UserProfile = () => {
    const [user, setUser] = useState(null); // State lưu trữ thông tin người dùng
    const [isFormChanged, setIsFormChanged] = useState(false); // Kiểm tra xem có thay đổi form không

    // Lấy thông tin người dùng khi trang load
    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            if (!token) {
                // Nếu không có token thì có thể redirect hoặc thông báo lỗi
                console.error("No token found. Please login first.");
                return;
            }

            try {
                const response = await axios.get("http://localhost:8080/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });
                console.log("respone: ",response.data.user);
                setUser(response.data.user); // Lưu thông tin người dùng vào state
                console.log("user: ",user);
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };

        fetchUserInfo();
    }, []);

    // Hàm để theo dõi khi form thay đổi
    const handleFormChange = () => {
        setIsFormChanged(true); // Đánh dấu là form có thay đổi
    };

    return (
        <>
            <div className="cs_site_header_spacing_100"></div>
            <div>
                {/* Header Profile */}
                <div
                    className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
                    style={{
                        minHeight: "400px",
                        backgroundImage: "url(/assets/img/profilePage_bg.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center 35%",
                    }}
                >
                    <div className="container-fluid d-flex align-items-center">
                        <div className="row">
                            <div className="col-lg-12 col-md-10">
                                <h1 className="display-2 text-white">Xin chào {user?.lastName||user?.username||"Null"}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="container-fluid" style={{ marginTop: "-6rem" }}>
                    <div className="row">
                        {/* Profile Card */}
                        <div className="col-xl-4 order-xl-2 mb-5 mb-xl-0">
                            <div className="card card-profile shadow">
                                <div className="row justify-content-center">
                                    <div className="col-lg-3 order-lg-2">
                                        <div className="card-profile-image pt-3">
                                            <a href="#">
                                                <img
                                                    src={
                                                        user?.imageUrl ||
                                                        "https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg"
                                                    }
                                                    style={{ borderRadius: "50%", marginTop: "-6rem" }}
                                                    alt="User"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body pt-0 pt-md-4 text-center">
                                    <h3>{user?.fullName || "Nguyễn Văn A"}</h3>
                                    <div className="h5 font-weight-300">
                                        <i className="ni location_pin mr-2"></i>
                                        {user?.location || "Đà Nẵng, Việt Nam"}
                                    </div>
                                    <hr className="my-4" />
                                    <div>
                                        <i className="mr-2"></i>
                                        {user?.phone || "+84 012 345 678"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="col-xl-8 order-xl-1">
                            <div className="card shadow">
                                <div className="card-header bg-white border-0 py-3">
                                    <div className="row align-items-center">
                                        <div className="col-8 ps-4">
                                            <h3 className="mb-0">Thông tin của tôi</h3>
                                        </div>
                                        <div className="col-4 d-flex justify-content-end pe-5">
                                            <Button className="btn btn-sm btn-primary">Đổi mật khẩu</Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Form Component */}
                                <ProfileForm user={user} onFormChange={handleFormChange} isFormChanged={isFormChanged} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: 40 }}></div>
        </>
    );
};

export default UserProfile;
