import { useState } from "react";
import "./login.css";
import doctorImage from "../assets/doctor.png";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaHeartbeat,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleGoogleSignIn = () => {
    alert("Google Sign-In will be connected to Firebase.");
  };
  const handleRegister = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("✅ Account created successfully!");
    }, 2000);
  };
  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo">
          <FaHeartbeat className="logo-icon" />
          <div>
            <h2>MediScan AI</h2>
            <span>AI Healthcare Platform</span>
          </div>
        </div>

        <div className="login-content">
          <h1>Medi-Scan</h1>
          <p>Sign in to access AI-powered healthcare services.</p>

          <form onSubmit={handleRegister}>
            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              {showPassword ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEye
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember Me
              </label>

              <a href="#">Forgot Password?</a>
            </div>

            <button className="login-btn">Sign In</button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      <div className="login-right">
        <img src={doctorImage} alt="doctor" />

        <div className="overlay">
          <h2>AI-Powered Healthcare</h2>

          <ul>
            <li>✔ Smart Diagnosis</li>
            <li>✔ Secure Patient Records</li>
            <li>✔ 24/7 AI Assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
