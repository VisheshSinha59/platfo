import { useState } from "react";
import Head from "next/head";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>{"Forgot Password — Platfo"}</title></Head>
      <div style={{
        minHeight: "100vh", background: "#111",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "20px",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          background: "#fff", borderRadius: "24px",
          padding: "40px 32px", maxWidth: "400px",
          width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"📧"}</div>
              <h3 style={{ color: "#111", marginBottom: "8px" }}>{"Check Your Email!"}</h3>
              <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "24px" }}>
                {"We sent a password reset link to "}<strong>{email}</strong>
              </p>
              <a href="/admin" style={{
                display: "block", background: "#FF3008", color: "#fff",
                textDecoration: "none", padding: "14px", borderRadius: "12px",
                fontWeight: 700, textAlign: "center"
              }}>
                {"Back to Login"}
              </a>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{"🔑"}</div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", margin: 0 }}>
                  {"Forgot Password?"}
                </h1>
                <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "8px" }}>
                  {"Enter your registered email address"}
                </p>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block", marginBottom: "6px" }}>
                  {"Email Address"}
                </label>
                <input
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid #EEE", fontSize: "1rem", outline: "none",
                    fontFamily: "sans-serif", boxSizing: "border-box"
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "#FFF0F0", border: "1.5px solid #FFB3B3",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#D00000", fontSize: "0.9rem",
                  marginBottom: "14px", textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%", background: loading ? "#999" : "#FF3008",
                  color: "#fff", border: "none", padding: "16px",
                  borderRadius: "12px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem", fontFamily: "sans-serif", marginBottom: "14px"
                }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div style={{ textAlign: "center" }}>
                <a href="/admin" style={{ color: "#888", fontSize: "0.9rem", textDecoration: "none" }}>
                  {"Back to Login"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
