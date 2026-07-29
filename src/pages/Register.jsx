import "./register.css";
import doctorImage from "../assets/doctor.png";
import {
  FaHeartbeat,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleRegister = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess("Account created successfully!");
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
        <h1>Create Account</h1>
        <p>Join MediScan AI and experience smarter healthcare.</p>

    {error && <p className="error">{error}</p>}
{success && <p className="success">{success}</p>}

        <form onSubmit={handleRegister}>
          <div className="input-box">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-box">
            <FaUser className="input-icon" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-box">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="input-box">
            <FaLock className="input-icon" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {showConfirmPassword ? (
              <FaEyeSlash
                className="eye-icon"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <FaEye
                className="eye-icon"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          <div className="terms">
            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the Terms & Conditions
            </label>
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>

    <div className="login-right">
      <img src={doctorImage} alt="doctor" />

      <div className="register-overlay">
        <h2>Welcome to MediScan AI</h2>

        <ul>
          <li>✔ AI Disease Detection</li>
          <li>✔ Secure Health Records</li>
          <li>✔ Fast Medical Assistance</li>
        </ul>
      </div>
    </div>
  </div>
);
};
export default Register;
