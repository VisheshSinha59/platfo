import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/restaurant?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); setLoading(false); return; }
      localStorage.setItem("restaurant", JSON.stringify(data.restaurant));
      localStorage.setItem("token", data.token);
      router.push("/admin/dashboard");
    } catch { setError("Something went wrong."); setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Login — Platfo</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #0A0A0A; }

        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        /* LEFT SIDE */
        .left-panel {
          background: #0A0A0A;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,48,8,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,48,8,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .brand {
          position: relative; z-index: 1;
          margin-bottom: 60px;
        }

        .brand-logo {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
        }

        .brand-logo span { color: #FF3008; }

        .brand-tag {
          font-size: 0.8rem;
          color: #555;
          margin-top: 6px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero-text {
          position: relative; z-index: 1;
          margin-bottom: 60px;
        }

        .hero-text h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .hero-text h1 em {
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
        }

        .hero-text p {
          color: #555;
          font-size: 1rem;
          line-height: 1.7;
          max-width: 360px;
        }

        .features {
          position: relative; z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .feature-dot {
          width: 8px; height: 8px;
          background: #FF3008;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(255,48,8,0.6);
        }

        .feature-text {
          font-size: 0.88rem;
          color: #666;
        }

        /* RIGHT SIDE */
        .right-panel {
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 50px;
          border-left: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }

        .form-box {
          width: 100%;
          max-width: 380px;
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .form-subtitle {
          color: #555;
          font-size: 0.88rem;
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-input-wrap {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          background: #1A1A1A;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.3s;
        }

        .form-input:focus {
          border-color: #FF3008;
          background: #1E1E1E;
          box-shadow: 0 0 0 3px rgba(255,48,8,0.1);
        }

        .form-input::placeholder { color: #333; }

        .show-pass {
          position: absolute;
          right: 16px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #444;
          cursor: pointer;
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .show-pass:hover { color: #FF3008; }

        .forgot-link {
          display: block;
          text-align: right;
          margin-top: 8px;
          font-size: 0.8rem;
          color: #444;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover { color: #FF3008; }

        .error-box {
          background: rgba(255,48,8,0.08);
          border: 1px solid rgba(255,48,8,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          color: #FF6B6B;
          font-size: 0.85rem;
          margin-bottom: 20px;
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 18px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 30px rgba(255,48,8,0.35);
          position: relative;
          overflow: hidden;
          margin-top: 8px;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .login-btn:hover::before { left: 100%; }
        .login-btn:hover { box-shadow: 0 12px 40px rgba(255,48,8,0.5); transform: translateY(-1px); }
        .login-btn:disabled { background: #333; box-shadow: none; cursor: not-allowed; transform: none; }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .divider-text {
          font-size: 0.75rem;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .bottom-links {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .bottom-links a {
          font-size: 0.85rem;
          color: #444;
          text-decoration: none;
          transition: color 0.2s;
        }

        .bottom-links a:hover { color: #fff; }
        .bottom-links a.highlight { color: #FF3008; font-weight: 500; }

        /* MOBILE */
        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { padding: 40px 24px; }
        }
      `}</style>

      <div className="login-page">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="grid-bg"></div>

          <div className="brand">
            <div className="brand-logo">Plat<span>fo</span></div>
            <div className="brand-tag">Restaurant OS</div>
          </div>

          <div className="hero-text">
            <h1>
              {"Manage your"}<br />
              {"restaurant"}<br />
              <em>{"smarter."}</em>
            </h1>
            <p>{"The complete QR-based ordering system built for modern Indian restaurants."}</p>
          </div>

          <div className="features">
            {[
              "QR ordering — no app needed",
              "Real-time kitchen display",
              "Order & revenue tracking",
              "GST receipts in one click",
              "Works on any device",
            ].map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-dot"></div>
                <span className="feature-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-box">

            <div className="form-title">{"Welcome back"}</div>
            <div className="form-subtitle">{"Sign in to your restaurant dashboard"}</div>

            <div className="form-group">
              <label className="form-label">{"Username"}</label>
              <div className="form-input-wrap">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{"Password"}</label>
              <div className="form-input-wrap">
                <input
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{ paddingRight: "70px" }}
                />
                <button className="show-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <a href="/forgot-password" className="forgot-link">{"Forgot password?"}</a>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">{"or"}</span>
              <div className="divider-line"></div>
            </div>

            <div className="bottom-links">
              <a href="/signup" className="highlight">{"Create Account"}</a>
              <a href="/superadmin">{"Super Admin"}</a>
              <a href="/landing">{"Back to Home"}</a>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
