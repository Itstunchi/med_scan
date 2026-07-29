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
    <div className="jp-login-page">
      <div className="jp-login-left">
        <div className="jp-login-logo">
          <FaHeartbeat className="jp-logo-icon" />
          <div>
            <h2>MediScan AI</h2>
            <span>AI Healthcare Platform</span>
          </div>
        </div>

        <div className="jp-login-content">
          <h1>Medi-Scan</h1>
          <p>Sign in to access AI-powered healthcare services.</p>

          <form onSubmit={handleRegister}>
            <div className="jp-input-box">
              <FaEnvelope className="jp-input-icon" />
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="jp-input-box">
              <FaLock className="jp-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />

              {showPassword ? (
                <FaEyeSlash
                  className="jp-eye-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEye
                  className="jp-eye-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <div className="jp-login-options">
              <label>
                <input type="checkbox" />
                Remember Me
              </label>

              <a href="#">Forgot Password?</a>
            </div>

            <button className="jp-login-btn">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="jp-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="jp-google-btn"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <p className="jp-register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      <div className="jp-login-right">
        <img src={doctorImage} alt="doctor" />

        <div className="jp-login-overlay">
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