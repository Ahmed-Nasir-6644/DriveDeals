"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import logo from "../assets/logo.png"
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { setEmail: setAuthEmail } = useAuth();

  // Step 1: Login with email + password
  const handleLoginSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setTempToken(data.tempToken);
        setStep("otp");
      } else {
        alert(data.message ?? "Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        setAuthEmail(email);
        alert("Login successful");
        navigate("/"); // redirect to home page
      } else {
        alert(data.message || "OTP validation failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {/* Left: Logo */}
          <div className={styles.logoWrapper}>
            <img src={logo} alt="DriveDeals" className={styles.logo} />
          </div>

          {/* Right: Form */}
          <div className={styles.formWrapper}>
            <h2 className={styles.title}>Login</h2>

            {step === "login" ? (
              <form onSubmit={handleLoginSetup} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" className={styles.loginBtn} disabled={loading}>
                  {loading ? "Processing..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpStep} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="otp">An OTP has been sent to {email}</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>

                <button type="submit" className={styles.loginBtn} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            <p className={styles.signupText}>
              New to DriveDeals? <a href="/signup">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
