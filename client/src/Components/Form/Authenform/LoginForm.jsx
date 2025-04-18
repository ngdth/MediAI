import React, { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa6";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra nếu URL có chứa token từ backend sau khi đăng nhập Google
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            fetchUserData(token);
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await fetch("http://localhost:8080/user/profile", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });


            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch user data");

            console.log(data);
            localStorage.setItem("username", data.user.username);
            onLogin(data);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8080/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            localStorage.setItem("token", data.token);
            console.log(data.token);
            localStorage.setItem("username", data.user.username);
            onLogin(data.user);

            if (data.user.role === "admin") {
                navigate("/admin");
            } else if (data.user.role === "nurse") {
                navigate("/nurse/dashboard");
            } else if (data.user.role === "doctor") {
                navigate("/doctor");
            }else if (data.user.role === "pharmacy") {
                navigate("/pharmacy");
            } else if (data.user.role === "head of department") {
                navigate("/hod");
            } else {navigate("/");}
        } catch (err) {
            setError(err.message);
            console.log(err);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8080/auth/google";
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="mb-4 text-center">Đăng nhập</h3>

            <div className="d-flex flex-row align-items-center justify-content-center">
                <button className="btn btn-outline-danger d-flex align-items-center" type="button" onClick={handleGoogleLogin}>
                    <FaGoogle className="me-2" /> Sign in with Google
                </button>
            </div>

            <div className="divider cs_center my-4">
                <p className="text-center fw-bold mx-3 mb-0">Hoặc</p>
            </div>

            <div className="mb-4">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-2">
                <label htmlFor="password">Mật khẩu</label>
                <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-flex justify-content-end">
                <Link className="text-decoration-underline small" to="/forgotPass">
                    Quên mật khẩu?
                </Link>
            </div>

            <div className="text-center">
                <Button type="submit" className="cs_btn cs_style_1 cs_color_1" style={{ border: "none", outline: "none" }}>
                    Đăng nhập
                </Button>
                <p className="small mt-2 pt-1 mb-2">
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/register" className="link-primary text-decoration-underline">
                        Đăng ký
                    </Link>{" "}
                    |{" "}
                    <Link to="/" className="link-primary text-decoration-underline">
                        Trang Chủ
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;	