import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    tableCount: "10",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!form.name || !form.username || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "2px solid #EEE",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "sans-serif",
    marginTop: "6px",
    boxSizing: "border-box",
  };

  if (success) {
    return (
      <>
        <Head><title>{"Check Your Email — Platfo"}</title></Head>
        <div style={{
          minHeight: "100vh", background: "#111",
          display: "flex", alignItems: "center",
          justifyContent: "center", padding: "20px",
          fontFamily: "sans-serif"
        }}>
          <div style={{
            background: "#fff", borderRadius: "24px",
            padding: "48px 36px", maxWidth: "420px",
            width: "100%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", marginBottom: "12px" }}>
              {"Check Your Email!"}
            </h2>
            <p style={{ color: "#555", marginBottom: "8px", lineHeight: 1.6 }}>
              {"We sent a verification link to:"}
            </p>
            <p style={{ fontWeight: 800, color: "#FF3008", fontSize: "1rem", marginBottom: "24px" }}>
              {form.email}
            </p>
            <div style={{
              background: "#FFF5F2", border: "2px solid #FFE0D6",
              borderRadius: "12px", padding: "16px",
              marginBottom: "24px", textAlign: "left"
            }}>
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#111", fontSize: "0.9rem" }}>
                {"Next steps:"}
              </p>
              <p style={{ margin: "4px 0", color: "#555", fontSize: "0.85rem" }}>{"1. Open your Gmail inbox"}</p>
              <p style={{ margin: "4px 0", color: "#555", fontSize: "0.85rem" }}>{"2. Find email from Platfo"}</p>
              <p style={{ margin: "4px 0", color: "#555", fontSize: "0.85rem" }}>{"3. Click Verify Email button"}</p>
              <p style={{ margin: "4px 0", color: "#555", fontSize: "0.85rem" }}>{"4. Login to your dashboard"}</p>
            </div>
            <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "20px" }}>
              {"Link expires in 24 hours. Check spam folder if not found."}
            </p>
            <button onClick={() => router.push("/admin")} style={{
              background: "#FF3008", color: "#fff", border: "none",
              padding: "14px", borderRadius: "12px", fontWeight: 700,
              cursor: "pointer", width: "100%", fontSize: "0.95rem",
              fontFamily: "sans-serif"
            }}>
              {"Go to Login"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>{"Sign Up — Platfo"}</title></Head>
      <div style={{
        minHeight: "100vh", background: "#111",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "20px",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          background: "#fff", borderRadius: "24px",
          padding: "40px 32px", maxWidth: "460px",
          width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🍽️</div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: 0 }}>
              {"Platfo"}
            </h1>
            <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "6px" }}>
              {"Create your restaurant account"}
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Restaurant Name"}
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. Pizza Palace"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Username"}
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. pizzapalace"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
              />
              <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "4px 0 0" }}>
                {"No spaces allowed. Used to login."}
              </p>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Email Address"}
              </label>
              <input
                style={inputStyle}
                type="email"
                placeholder="restaurant@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "4px 0 0" }}>
                {"Verification link will be sent here."}
              </p>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Password"}
              </label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Confirm Password"}
              </label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#333", display: "block" }}>
                {"Number of Tables"}
              </label>
              <input
                style={inputStyle}
                type="number"
                placeholder="10"
                min="1"
                max="50"
                value={form.tableCount}
                onChange={(e) => setForm({ ...form, tableCount: e.target.value })}
              />
            </div>

            {error && (
              <div style={{
                background: "#FFF0F0", border: "1.5px solid #FFB3B3",
                borderRadius: "10px", padding: "12px 14px",
                color: "#D00000", fontSize: "0.9rem", textAlign: "center"
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                background: loading ? "#999" : "#FF3008",
                color: "#fff", border: "none", padding: "16px",
                borderRadius: "12px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem", fontFamily: "sans-serif",
                boxShadow: "0 6px 20px rgba(255,48,8,0.3)"
              }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Login Link */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span style={{ color: "#888", fontSize: "0.9rem" }}>
              {"Already have an account? "}
            </span>
            <a href="/admin" style={{
              color: "#FF3008", fontWeight: 700,
              fontSize: "0.9rem", textDecoration: "none"
            }}>
              {"Login"}
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
