import React from 'react';
import '../styles/login.css';

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-image">
          <img
            src="https://file.hstatic.net/200000692767/collection/banner_website_tet_2025_digital_mkt_2136x569_copy_2_3a3c1d738a73446a9d1848cf580cc0a8.jpg" // Replace with the actual path of your image
            alt="Participation Illustration"
          />
        </div>
        <p className="login-message">
          Your Participation will help in Research and Saving Many Lives
        </p>
      </div>
      <div className="login-right">
        <h1 className="login-title">
          Welcome to <span className="highlight">Clinical Trials Enrollment System</span>
        </h1>
        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your Email here" />
          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input type="password" id="password" placeholder="Enter your Password" />
            <span className="toggle-password">👁️</span>
          </div>
          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="register-link">
          Don’t have an account? <a href="/register">Register Now</a>
        </p>
        <footer className="login-footer">
          <p>Copyright © 2022 Pharma Co. All rights reserved.</p>
          <a href="/terms">Terms & Conditions</a>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
