import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true);
    setError("");
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
      <Head><title>Login - Platfo</title></Head>
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍽️</div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>Platfo</h1>
            <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "6px" }}>Sign in to manage your restaurant</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", marginTop: "6px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", marginTop: "6px", boxSizing: "border-box" }} />
            </div>
            <div style={{ textAlign: "right", marginTop: "-8px" }}>
              <a href="/forgot-password" style={{ color: "#FF3008", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</a>
            </div>
            <button onClick={handleLogin} disabled={loading} style={{ background: loading ? "#999" : "#FF3008", color: "#fff", border: "none", padding: "18px", borderRadius: "14px", fontSize: "1.1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 6px 20px rgba(255,48,8,0.4)", fontFamily: "sans-serif" }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "24px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <a href="/signup" style={{ color: "#FF3008", fontSize: "0.9rem", textDecoration: "none", fontWeight: 700 }}>Create Account</a>
            <a href="/forgot-password" style={{ color: "#888", fontSize: "0.9rem", textDecoration: "none" }}>Forgot Password?</a>
            <a href="/superadmin" style={{ color: "#aaa", fontSize: "0.9rem", textDecoration: "none" }}>Super Admin</a>
          </div>
        </div>
      </div>
    </>
  );
}
