import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { useAuth } from "../lib/auth.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = () => {
    alert("Google Sign-In will be connected to Firebase.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('STEP 1: form submitted', email, password);
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      console.log('STEP 2: signIn returned', error);

      setLoading(false);

      if (error) {
        console.log('STEP 3: login failed:', error.message);
        setError(error.message || "Invalid email or password.");
        return;
      }

      console.log('STEP 4: success, navigating to dashboard');
      navigate("/dashboard");
    } catch (err) {
      console.log('EXCEPTION CAUGHT:', err);
      setLoading(false);
      setError("Something went wrong: " + err.message);
    }
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

          {error && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="jp-input-box">
              <FaEnvelope className="jp-input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="jp-input-box">
              <FaLock className="jp-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            <button className="jp-login-btn" type="submit" disabled={loading}>
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