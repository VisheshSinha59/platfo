import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", username: "", password: "", confirmPassword: "", email: "", tableCount: "10",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.name.trim()) { setError("Restaurant name is required."); return; }
      if (!formData.email.trim()) { setError("Email is required."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError("Enter a valid email."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!formData.username.trim()) { setError("Username is required."); return; }
      if (formData.username.length < 3) { setError("Username must be at least 3 characters."); return; }
      if (!formData.password) { setError("Password is required."); return; }
      if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          tableCount: formData.tableCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      setSuccess(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
    color: "#fff", fontSize: "0.95rem", outline: "none",
    fontFamily: "sans-serif", boxSizing: "border-box", transition: "border 0.2s",
  };

  return (
    <>
      <Head><title>{"Sign Up — Platfo"}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(255,48,8,0.6) !important; background: rgba(255,48,8,0.05) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", fontFamily: "sans-serif" }}>

        {/* Left Panel */}
        <div style={{ flex: 1, display: "none", background: "linear-gradient(135deg, #111 0%, #1A0A0A 100%)", padding: "60px", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", "@media(minWidth:768px)": { display: "flex" } }} className="left-panel">
          <style>{`.left-panel { display: none; } @media (min-width: 900px) { .left-panel { display: flex !important; } }`}</style>

          {/* Background glow */}
          <div style={{ position: "absolute", top: "20%", left: "30%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,48,8,0.12) 0%, transparent 70%)", borderRadius: "50%", animation: "float 8s ease-in-out infinite", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px" }}>
              <div style={{ width: "40px", height: "40px", background: "#FF3008", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", boxShadow: "0 0 20px rgba(255,48,8,0.4)" }}>{"🍽️"}</div>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#fff" }}>{"Platfo"}</span>
            </div>

            <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "20px" }}>
              {"Start your"}<br />
              <span style={{ color: "#FF3008" }}>{"digital journey"}</span><br />
              {"today."}
            </h1>
            <p style={{ color: "#555", fontSize: "1rem", lineHeight: 1.7, maxWidth: "360px" }}>
              {"Join hundreds of restaurants already using Platfo to manage orders, delight customers and grow their business."}
            </p>
          </div>

          {/* Feature Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
            {[
              { icon: "📱", title: "QR Code Ordering", desc: "Customers order from their phones" },
              { icon: "👨‍🍳", title: "Kitchen Display", desc: "Real-time order management" },
              { icon: "📊", title: "Smart Dashboard", desc: "Track orders and revenue" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "1.3rem" }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>{f.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "2px" }}>{f.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#FF3008", fontSize: "0.8rem" }}>{"✓"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — Form */}
        <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>

          {success ? (
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
              <div style={{ width: "80px", height: "80px", background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 24px", border: "2px solid rgba(74,222,128,0.3)" }}>{"✅"}</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>{"Check Your Email!"}</h2>
              <p style={{ color: "#555", marginBottom: "8px", lineHeight: 1.6 }}>{"We sent a verification link to"}</p>
              <p style={{ color: "#FF3008", fontWeight: 700, marginBottom: "32px" }}>{formData.email}</p>
              <p style={{ color: "#444", fontSize: "0.85rem", marginBottom: "32px" }}>{"Click the link in the email to activate your account. Check your spam folder if you don't see it."}</p>
              <a href="/admin" style={{ display: "inline-block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "0.95rem" }}>{"Go to Login →"}</a>
            </div>
          ) : (
            <div style={{ animation: "fadeUp 0.4s ease" }}>

              {/* Header */}
              <div style={{ marginBottom: "40px" }}>
                <a href="/landing" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "32px" }}>
                  <div style={{ width: "32px", height: "32px", background: "#FF3008", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>{"🍽️"}</div>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>{"Platfo"}</span>
                </a>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{"Create your account"}</h2>
                <p style={{ color: "#555", fontSize: "0.88rem" }}>{"Already have an account? "}<a href="/admin" style={{ color: "#FF3008", textDecoration: "none", fontWeight: 600 }}>{"Sign in"}</a></p>
              </div>

              {/* Progress Steps */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "36px", gap: "0" }}>
                {[1, 2, 3].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 3 ? 1 : "none" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.82rem", flexShrink: 0, background: step > s ? "#FF3008" : step === s ? "rgba(255,48,8,0.2)" : "rgba(255,255,255,0.05)", color: step > s ? "#fff" : step === s ? "#FF3008" : "#444", border: step === s ? "2px solid #FF3008" : "2px solid transparent", transition: "all 0.3s" }}>
                      {step > s ? "✓" : s}
                    </div>
                    {s < 3 && <div style={{ flex: 1, height: "2px", background: step > s ? "#FF3008" : "rgba(255,255,255,0.06)", transition: "background 0.3s", margin: "0 8px" }} />}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", marginTop: "-24px" }}>
                {["Restaurant Info", "Account Setup", "Table Setup"].map((label, i) => (
                  <div key={label} style={{ fontSize: "0.68rem", color: step === i + 1 ? "#FF3008" : "#444", fontWeight: step === i + 1 ? 700 : 400, textAlign: i === 1 ? "center" : i === 2 ? "right" : "left", flex: 1 }}>{label}</div>
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.3s ease" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Restaurant Name *"}</label>
                    <input style={inputStyle} placeholder="e.g. Spice Garden" value={formData.name} onChange={(e) => update("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Email Address *"}</label>
                    <input style={inputStyle} type="email" placeholder="your@gmail.com" value={formData.email} onChange={(e) => update("email", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                    <p style={{ fontSize: "0.72rem", color: "#444", marginTop: "6px" }}>{"We'll send a verification link to this email"}</p>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.3s ease" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Username *"}</label>
                    <input style={inputStyle} placeholder="e.g. spicegarden" value={formData.username} onChange={(e) => update("username", e.target.value.toLowerCase())} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                    <p style={{ fontSize: "0.72rem", color: "#444", marginTop: "6px" }}>{"Used to login. Only lowercase letters and numbers."}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Password *"}</label>
                    <input style={inputStyle} type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => update("password", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Confirm Password *"}</label>
                    <input style={inputStyle} type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeUp 0.3s ease" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: 600 }}>{"Review Details"}</div>
                    {[
                      { label: "Restaurant", value: formData.name },
                      { label: "Email", value: formData.email },
                      { label: "Username", value: formData.username },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
                        <span style={{ color: "#555" }}>{item.label}</span>
                        <span style={{ color: "#fff", fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Number of Tables *"}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                      {["5", "10", "15", "20", "25"].map((n) => (
                        <button key={n} onClick={() => update("tableCount", n)} style={{ padding: "12px", borderRadius: "10px", border: formData.tableCount === n ? "2px solid #FF3008" : "1px solid rgba(255,255,255,0.08)", background: formData.tableCount === n ? "rgba(255,48,8,0.15)" : "rgba(255,255,255,0.03)", color: formData.tableCount === n ? "#FF3008" : "#666", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", fontFamily: "sans-serif" }}>{n}</button>
                      ))}
                    </div>
                    <input style={{ ...inputStyle, marginTop: "10px" }} type="number" placeholder="Or enter custom number" value={formData.tableCount} onChange={(e) => update("tableCount", e.target.value)} min="1" max="100" />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(255,48,8,0.1)", border: "1px solid rgba(255,48,8,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#FF6B6B", fontSize: "0.85rem", marginTop: "16px" }}>
                  {"⚠️ " + error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                {step > 1 && (
                  <button onClick={() => { setStep(step - 1); setError(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "sans-serif" }}>{"← Back"}</button>
                )}
                {step < 3 ? (
                  <button onClick={handleNext} style={{ flex: 2, background: "#FF3008", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(255,48,8,0.3)", transition: "all 0.2s" }}>{"Continue →"}</button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: loading ? "#333" : "#FF3008", color: loading ? "#666" : "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: "0.95rem", fontFamily: "sans-serif", boxShadow: loading ? "none" : "0 4px 20px rgba(255,48,8,0.3)", transition: "all 0.2s" }}>
                    {loading ? "Creating Account..." : "Create Account 🚀"}
                  </button>
                )}
              </div>

              <p style={{ textAlign: "center", color: "#333", fontSize: "0.75rem", marginTop: "24px" }}>
                {"By signing up you agree to our "}
                <a href="#" style={{ color: "#555", textDecoration: "none" }}>{"Terms of Service"}</a>
                {" and "}
                <a href="#" style={{ color: "#555", textDecoration: "none" }}>{"Privacy Policy"}</a>
              </p>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
