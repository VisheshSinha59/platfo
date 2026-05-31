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
          name: formData.name, username: formData.username,
          password: formData.password, email: formData.email, tableCount: formData.tableCount,
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

  const FEATURES = [
    { icon: "📱", title: "QR Code Ordering", desc: "Customers order from their phones" },
    { icon: "🤖", title: "AI Menu Assistant", desc: "AI answers customer questions instantly", isNew: true },
    { icon: "👨‍🍳", title: "Kitchen Display", desc: "Real-time order management" },
    { icon: "📊", title: "Smart Dashboard", desc: "Track orders and revenue" },
    { icon: "📦", title: "Inventory Tracking", desc: "Auto-deducts stock on orders" },
    { icon: "🧾", title: "GST Receipts", desc: "Professional receipts with CGST+SGST" },
  ];

  return (
    <>
      <Head><title>{"Sign Up — Platfo"}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0A0A0A; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(255,48,8,0.6) !important; background: rgba(255,48,8,0.04) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(255,48,8,0.3); } 50% { box-shadow: 0 0 50px rgba(255,48,8,0.7); } }
        @keyframes aiPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(129,140,248,0.3); } 50% { box-shadow: 0 0 0 8px rgba(129,140,248,0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .left-panel { display: none !important; }
        @media (min-width: 900px) { .left-panel { display: flex !important; } }
        .table-btn:hover { background: rgba(255,48,8,0.1) !important; border-color: rgba(255,48,8,0.3) !important; color: #FF3008 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", fontFamily: "sans-serif", color: "#fff" }}>

        {/* LEFT PANEL */}
        <div className="left-panel" style={{ flex: 1, background: "linear-gradient(135deg, #0D0D0D 0%, #0A0008 100%)", padding: "50px 48px", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Background glow */}
          <div style={{ position: "absolute", top: "15%", left: "20%", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(255,48,8,0.08) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <a href="/landing" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", marginBottom: "64px" }}>
              <div style={{ width: "40px", height: "40px", background: "#FF3008", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", animation: "glow 3s ease-in-out infinite" }}>{"🍽️"}</div>
              <span style={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.5px" }}>{"Platfo"}</span>
            </a>

            <div style={{ marginBottom: "10px" }}>
              <h1 style={{ fontSize: "2.6rem", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "16px" }}>
                {"Start your"}
                <br />
                <span style={{ color: "#FF3008" }}>{"digital journey"}</span>
                <br />
                {"today."}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "340px" }}>
                {"Join hundreds of restaurants already using Platfo to delight customers and grow their business."}
              </p>
            </div>

            {/* AI Feature Callout */}
            <div style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.1), rgba(167,139,250,0.06))", border: "1px solid rgba(129,140,248,0.25)", borderRadius: "14px", padding: "16px 18px", marginTop: "28px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", background: "rgba(129,140,248,0.15)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, animation: "aiPulse 2.5s infinite" }}>{"🤖"}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>{"AI Menu Assistant"}</span>
                  <span style={{ background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.4)", color: "#a78bfa", fontSize: "0.55rem", fontWeight: 800, padding: "2px 6px", borderRadius: "5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{"NEW"}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  {"Every restaurant gets an AI bot that answers customer menu questions instantly."}
                </p>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: "6px" }}>{"What you get"}</div>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: "12px", background: f.isNew ? "rgba(129,140,248,0.06)" : "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 14px", border: f.isNew ? "1px solid rgba(129,140,248,0.15)" : "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "1rem", flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.82rem", color: f.isNew ? "#a78bfa" : "#fff" }}>{f.title}</span>
                    {f.isNew && <span style={{ background: "rgba(129,140,248,0.2)", color: "#a78bfa", fontSize: "0.5rem", fontWeight: 800, padding: "1px 5px", borderRadius: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{"NEW"}</span>}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>{f.desc}</div>
                </div>
                <div style={{ color: f.isNew ? "#a78bfa" : "#FF3008", fontSize: "0.75rem", fontWeight: 700 }}>{"✓"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", padding: "40px 28px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>

          {success ? (
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
              <div style={{ width: "80px", height: "80px", background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 24px", border: "2px solid rgba(74,222,128,0.3)" }}>{"✅"}</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>{"Check Your Email!"}</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "8px", lineHeight: 1.6 }}>{"We sent a verification link to"}</p>
              <p style={{ color: "#FF3008", fontWeight: 700, marginBottom: "32px", fontSize: "1rem" }}>{formData.email}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginBottom: "32px", lineHeight: 1.6 }}>{"Click the link in the email to activate your account. Check your spam folder if you don't see it within 2 minutes."}</p>
              <div style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>{"🤖"}</span>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.5 }}>{"Your AI Menu Assistant will be ready the moment you log in."}</p>
              </div>
              <a href="/admin" style={{ display: "inline-block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 0 24px rgba(255,48,8,0.3)" }}>{"Go to Login →"}</a>
            </div>
          ) : (
            <div style={{ animation: "fadeUp 0.4s ease" }}>

              {/* Header */}
              <div style={{ marginBottom: "36px" }}>
                <a href="/landing" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "28px" }}>
                  <div style={{ width: "30px", height: "30px", background: "#FF3008", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>{"🍽️"}</div>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{"Platfo"}</span>
                </a>
                <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px" }}>{"Create your account"}</h2>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>
                  {"Already have an account? "}
                  <a href="/admin" style={{ color: "#FF3008", textDecoration: "none", fontWeight: 600 }}>{"Sign in"}</a>
                </p>
              </div>

              {/* Progress Steps */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                  {[1, 2, 3].map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 3 ? 1 : "none" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.82rem", flexShrink: 0, background: step > s ? "#FF3008" : step === s ? "rgba(255,48,8,0.15)" : "rgba(255,255,255,0.05)", color: step > s ? "#fff" : step === s ? "#FF3008" : "#444", border: step === s ? "2px solid #FF3008" : step > s ? "2px solid #FF3008" : "2px solid rgba(255,255,255,0.06)", transition: "all 0.3s" }}>
                        {step > s ? "✓" : s}
                      </div>
                      {s < 3 && <div style={{ flex: 1, height: "2px", background: step > s ? "#FF3008" : "rgba(255,255,255,0.06)", transition: "background 0.4s", margin: "0 10px" }} />}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {["Restaurant Info", "Account Setup", "Table Setup"].map((label, i) => (
                    <div key={label} style={{ fontSize: "0.68rem", color: step === i + 1 ? "#FF3008" : "rgba(255,255,255,0.25)", fontWeight: step === i + 1 ? 700 : 400, flex: 1, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>{label}</div>
                  ))}
                </div>
              </div>

              {/* Step 1 — Restaurant Info */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slideIn 0.3s ease" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>{"Restaurant Name *"}</label>
                    <input style={inputStyle} placeholder="e.g. Spice Garden" value={formData.name} onChange={(e) => update("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>{"Email Address *"}</label>
                    <input style={inputStyle} type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => update("email", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>{"We'll send a verification link to activate your account"}</p>
                  </div>
                </div>
              )}

              {/* Step 2 — Account Setup */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slideIn 0.3s ease" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>{"Username *"}</label>
                    <input style={inputStyle} placeholder="e.g. spicegarden" value={formData.username} onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>{"Lowercase letters and numbers only · Used to login"}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>{"Password *"}</label>
                    <input style={inputStyle} type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => update("password", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>{"Confirm Password *"}</label>
                    <input style={inputStyle} type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNext()} />
                    {formData.confirmPassword && (
                      <p style={{ fontSize: "0.72rem", marginTop: "6px", color: formData.password === formData.confirmPassword ? "#4ADE80" : "#FF6B6B" }}>
                        {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 — Table Setup */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "slideIn 0.3s ease" }}>
                  {/* Review */}
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: 600 }}>{"Review Details"}</div>
                    {[
                      { label: "Restaurant", value: formData.name },
                      { label: "Email", value: formData.email },
                      { label: "Username", value: formData.username },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
                        <span style={{ color: "#fff", fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Feature reminder */}
                  <div style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{"🤖"}</span>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#a78bfa", marginBottom: "2px" }}>{"AI Menu Assistant included!"}</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>{"Your AI bot will be ready as soon as you log in."}</div>
                    </div>
                  </div>

                  {/* Tables */}
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>{"Number of Tables *"}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "10px" }}>
                      {["5", "10", "15", "20", "25"].map((n) => (
                        <button key={n} className="table-btn" onClick={() => update("tableCount", n)} style={{ padding: "13px 6px", borderRadius: "10px", border: formData.tableCount === n ? "2px solid #FF3008" : "1px solid rgba(255,255,255,0.08)", background: formData.tableCount === n ? "rgba(255,48,8,0.15)" : "rgba(255,255,255,0.03)", color: formData.tableCount === n ? "#FF3008" : "rgba(255,255,255,0.4)", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s", fontFamily: "sans-serif" }}>{n}</button>
                      ))}
                    </div>
                    <input style={inputStyle} type="number" placeholder="Or enter custom number (1–100)" value={formData.tableCount} onChange={(e) => update("tableCount", e.target.value)} min="1" max="100" />
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>{"You can change this later in Settings"}</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(255,48,8,0.08)", border: "1px solid rgba(255,48,8,0.25)", borderRadius: "10px", padding: "12px 16px", color: "#FF6B6B", fontSize: "0.85rem", marginTop: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{"⚠️"}</span>{error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                {step > 1 && (
                  <button onClick={() => { setStep(step - 1); setError(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "sans-serif", transition: "all 0.2s" }}>{"← Back"}</button>
                )}
                {step < 3 ? (
                  <button onClick={handleNext} style={{ flex: 2, background: "#FF3008", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "sans-serif", boxShadow: "0 4px 24px rgba(255,48,8,0.35)", transition: "all 0.2s" }}>{"Continue →"}</button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: loading ? "#1a1a1a" : "#FF3008", color: loading ? "rgba(255,255,255,0.3)" : "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: "0.95rem", fontFamily: "sans-serif", boxShadow: loading ? "none" : "0 4px 24px rgba(255,48,8,0.35)", transition: "all 0.2s" }}>
                    {loading ? "Creating Account..." : "Create Account 🚀"}
                  </button>
                )}
              </div>

              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", marginTop: "20px" }}>
                {"By signing up you agree to our "}
                <a href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{"Terms"}</a>
                {" and "}
                <a href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{"Privacy Policy"}</a>
              </p>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
