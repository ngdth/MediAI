import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../../sass/common/_general.scss";
// import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const url = "http://localhost:8080/user/login";

    //   const [isChecked, setIsChecked] = useState(false);

    //   const handleCheckboxChange = (e) => {
    //     setIsChecked(e.target.checked);
    //   };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            localStorage.setItem("token", data.token);

            onLogin(data.user);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    //   const handleGoogleLogin = (response) => {
    //     console.log('Google login response:', response);
    //     // Handle the Google login response here (e.g., send the token to your backend)
    //   };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="mb-4 text-center">Welcome Back!</h3>
            <p className="text-center">Please login to your account to continue</p>

            <div className="d-flex flex-row align-items-center justify-content-center">
                <button className="btn btn-outline-danger d-flex align-items-center" type="button">
                    <FaGoogle className="me-2" /> Sign in with Google
                </button>
            </div>

            {/* <div className="d-flex flex-row align-items-center justify-content-center">
        <p className="lead fw-normal mb-0 me-3">Sign in with</p>
        <GoogleLogin 
          onSuccess={handleGoogleLogin} 
          onError={() => console.log('Login Failed')}
          useOneTap
          theme="outline"
        />
      </div> */}

            <div className="divider cs_center my-4">
                <p className="text-center fw-bold mx-3 mb-0">Or</p>
            </div>

            <div className="mb-4">
                <label htmlFor="email">Email Address</label>
                <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-2">
                <label htmlFor="password">Password</label>
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
                {/* <label>
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                    Remember me
                </label> */}
                {/* <a href="*">Forgot password?</a> */}
                <Link className="text-decoration-underline small" to="*">
                    Forgot password?
                </Link>
            </div>

            <div className="text-center">
                <Button
                    type="submit"
                    className="cs_btn cs_style_1 cs_color_1"
                    style={{ border: "none", outline: "none" }}
                >
                    Login
                </Button>
                <p className="small mt-2 pt-1 mb-2">
                    Don't have an account?{" "}
                    <Link to="/register" className="link-primary text-decoration-underline">
                        Register
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
