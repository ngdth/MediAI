import React, { useEffect, useState } from "react";
import ProfileForm from "../../components/Form/ProfileForm/ProfileForm";
import ChangePassForm from "../../components/Form/ProfileForm/ChangePassForm";
import { Button } from "react-bootstrap";
import axios from "axios";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [showChangePassForm, setShowChangePassForm] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Please login first.");
                return;
            }

            try {
                const response = await axios.get("http://localhost:8080/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("response: ", response.data.user);
                setUser(response.data.user);
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };

        fetchUserInfo();
    }, []);

    const handleFormChange = (changed) => {
        setIsFormChanged(changed);
    };

    const handleChangePassClick = () => {
        setShowChangePassForm(true);
    };

    const handleBackToProfile = () => {
        setShowChangePassForm(false);
    };

    return (
        <>
            <div className="cs_site_header_spacing_100"></div>
            <div>
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
                                <h1 className="display-2 text-white">
                                    Xin chào {user?.lastName || user?.username || "Null"}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid" style={{ marginTop: "-6rem" }}>
                    <div className="row">
                        <div className="col-xl-4 order-xl-2 mb-5 mb-xl-0">
                            <div className="card card-profile shadow">
                                <div className="row justify-content-center">
                                    <div className="col-lg-3 order-lg-2">
                                        <div className="card-profile-image pt-3">
                                            <a href="#">
                                                <img
                                                    src={user?.imageUrl || "https://i.pinimg.com/736x/16/b2/e2/16b2e2579118bf6fba3b56523583117f.jpg"}
                                                    style={{ borderRadius: "50%", marginTop: "-6rem" }}
                                                    alt="User"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body pt-0 pt-md-4 text-center">
                                    <h3>{user?.lastName && user?.firstName ? `${user?.lastName} ${user?.firstName}` : ""}</h3>
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

                        <div className="col-xl-8 order-xl-1">
                            <div className="card shadow">
                                <div className="card-header bg-white border-0 py-3">
                                    <div className="row align-items-center">
                                        <div className="col-8 ps-4">
                                            <h3 className="mb-0">Thông tin của tôi</h3>
                                        </div>
                                        <div className="col-4 d-flex justify-content-end pe-5">
                                            {!user?.googleId && (
                                                <Button className="btn btn-sm btn-primary"
                                                    onClick={showChangePassForm ? handleBackToProfile : handleChangePassClick}
                                                >
                                                    {showChangePassForm ? "Trở về" : "Đổi mật khẩu"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {showChangePassForm ? (
                                    <ChangePassForm userId={user?._id} onBackToProfile={handleBackToProfile} />
                                ) : (
                                    //onFormChange bao hieu co su thay doi trong form
                                    //isFormChanged de check xem nut cap nhat co bam duoc hay khong
                                    <ProfileForm user={user} onFormChange={handleFormChange} isFormChanged={isFormChanged}/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;
