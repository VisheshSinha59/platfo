import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/resetpassword?token=" + token)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setValid(true);
        else setError(data.error || "Invalid link.");
        setVerifying(false);
      })
      .catch(() => { setError("Something went wrong."); setVerifying(false); });
  }, [token]);

  const handleReset = async () => {
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  if (verifying) return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
        <p>Verifying link...</p>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>Reset Password - Platfo</title></Head>
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
              <h2 style={{ color: "#111", marginBottom: "8px" }}>Password Reset!</h2>
              <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "24px" }}>Your password has been updated successfully.</p>
              <a href="/admin" style={{ display: "block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, textAlign: "center" }}>Login Now</a>
            </div>
          ) : !valid ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❌</div>
              <h2 style={{ color: "#111", marginBottom: "8px" }}>Invalid Link</h2>
              <p style={{ color: "#D00000", fontSize: "0.9rem", marginBottom: "24px" }}>{error}</p>
              <a href="/forgot-password" style={{ display: "block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, textAlign: "center" }}>Request New Link</a>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔐</div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", margin: 0 }}>Reset Password</h1>
                <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "8px" }}>Enter your new password</p>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block", marginBottom: "6px" }}>New Password</label>
                <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block", marginBottom: "6px" }}>Confirm Password</label>
                <input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" }} />
              </div>
              {error && (<div style={{ background: "#FFF0F0", border: "1.5px solid #FFB3B3", borderRadius: "10px", padding: "10px 14px", color: "#D00000", fontSize: "0.9rem", marginBottom: "14px", textAlign: "center" }}>{error}</div>)}
              <button onClick={handleReset} disabled={loading} style={{ width: "100%", background: loading ? "#999" : "#FF3008", color: "#fff", border: "none", padding: "16px", borderRadius: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", fontFamily: "sans-serif" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
