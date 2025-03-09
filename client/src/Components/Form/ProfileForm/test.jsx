import React from "react";
import { Form, Button, Alert } from "react-bootstrap";

const UserProfile = () => {
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
                                {/* Đổi tên mặc định thành tên của account */}
                                <h1 className="display-2 text-white">Xin chào Đại</h1>
                                {/* <p className="text-white mt-0 mb-5">
                                    Đây là trang thông tin của bạn. Bạn có thể xem các thông tin của bạn ở đây 
                                </p> */}
                            </div>
                        </div>
                    </div>
                    {/* <span
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "64%",
                            transition: "all 0.15s ease",
                            background: "linear-gradient(87deg, #172b4d 0, #1a174d 100%)",
                            opacity: 0.8,
                        }}
                    ></span> */}
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
                                                    src="https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg"
                                                    style={{ borderRadius: "50%", marginTop: "-6rem" }}
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body pt-0 pt-md-4">
                                    <div className="text-center">
                                        <h3>
                                            Nguyễn Văn A<span className="font-weight-light">, 27</span>
                                        </h3>
                                        <div className="h5 font-weight-300">
                                            <i className="ni location_pin mr-2"></i>Đà Nẵng, Việt Nam
                                        </div>
                                        <hr className="my-4" />
                                        <div>
                                            <i className="mr-2"></i>+84 012 345 678
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-8 order-xl-1">
                            <div className="card shadow">
                                <div className="card-header bg-white border-0 py-3">
                                    <div className="row align-items-center">
                                        <div className="col-8 ps-4">
                                            <h3 className="mb-0 ">Thông tin của tôi</h3>
                                        </div>
                                        {/* Buttom setting sẽ đổi thành dropbox như header để chuyển sang các màn hình khác (View health record, change pass, view lịch sử) hoặc nếu không sẽ để đường dẫn dưới profile pic */}
                                        <div className="col-4 d-flex justify-content-end pe-5">
                                            <a href="#!" className="btn btn-sm btn-primary">
                                                Cài đặt
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body" style={{ backgroundColor: "#F7FAFC" }}>
                                    <Form>
                                        <h6 className="heading-small text-muted mb-4 ps-4">Thông tin cơ bản</h6>
                                        <div className="pl-lg-4 ps-5">
                                            <div className="row mb-5">
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-username">
                                                            Tên đăng nhập
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="input-username"
                                                            className="form-control form-control-alternative"
                                                            placeholder="Username"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="form-group">
                                                        <label className="form-control-label" for="input-email">
                                                            Địa chỉ email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            id="input-email"
                                                            className="form-control form-control-alternative"
                                                            placeholder="example@example.com"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-first-name">
                                                            Họ
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="input-first-name"
                                                            className="form-control form-control-alternative"
                                                            placeholder="Last name"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-last-name">
                                                            Tên
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="input-last-name"
                                                            className="form-control form-control-alternative"
                                                            placeholder="First name"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row pb-3">
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-birthday">
                                                            Ngày sinh
                                                        </label>    
                                                        <input
                                                            type="date"
                                                            id="input-birthday"
                                                            className="form-control form-control-alternative"
                                                            placeholder="First name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-gender">
                                                            Giới tính
                                                        </label>
                                                        <select id="input-gender" className="mySelect">
                                                            <option value="option1">Nam</option>
                                                            <option value="option2">Nữ</option>
                                                            <option value="option3">Khác</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4"></hr>

                                        <h6 className="heading-small text-muted mb-4 ps-4">Liên hệ</h6>
                                        <div className="pl-lg-4 ps-5">
                                            <div className="row mb-3">
                                                <div className="col-md-12">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-address">
                                                            Địa chỉ
                                                        </label>
                                                        <input
                                                            id="input-address"
                                                            className="form-control form-control-alternative"
                                                            placeholder="Số nhà, tên đường"
                                                            value=""
                                                            type="text"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-city">
                                                            Thành phố
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="input-city"
                                                            className="form-control form-control-alternative"
                                                            placeholder="City"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-country">
                                                            Quốc Gia
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="input-country"
                                                            className="form-control form-control-alternative"
                                                            placeholder="Country"
                                                            value=""
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-12">
                                                    <div className="form-group focused">
                                                        <label className="form-control-label" for="input-address">
                                                            Số điện thoại
                                                        </label>
                                                        <input
                                                            id="input-address"
                                                            className="form-control form-control-alternative"
                                                            placeholder="(+84) 123 456 789"
                                                            value=""
                                                            type="tel"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
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