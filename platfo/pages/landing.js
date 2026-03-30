import Head from "next/head";
import { useEffect, useState, useRef } from "react";

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [counts, setCounts] = useState({ restaurants: 0, orders: 0, uptime: 0 });
  const statsRef = useRef(null);
  const statsAnimated = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-cycle demo steps
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsAnimated.current) {
        statsAnimated.current = true;
        animateCount(500, (v) => setCounts((p) => ({ ...p, restaurants: v })));
        animateCount(100000, (v) => setCounts((p) => ({ ...p, orders: v })));
        animateCount(99, (v) => setCounts((p) => ({ ...p, uptime: v })));
      }
    }, { threshold: 0.5 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCount = (target, setter) => {
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setter(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 24);
  };

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) scale(1)";
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px) scale(0.98)";
      el.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const FEATURES = [
    { icon: "📱", title: "QR Code Ordering", desc: "Customers scan, browse and order from their phones. Zero app downloads. Zero friction.", color: "#FF3008" },
    { icon: "👨‍🍳", title: "Kitchen Display", desc: "Real-time order management. New, Preparing, Ready — your kitchen always knows.", color: "#818CF8" },
    { icon: "📊", title: "Smart Dashboard", desc: "Track orders, revenue and performance. Filter by date. Download reports.", color: "#4ADE80" },
    { icon: "🧾", title: "GST Receipts", desc: "Auto-generate professional receipts with CGST & SGST. Print with one click.", color: "#FFC107" },
    { icon: "🔐", title: "Bank-Grade Security", desc: "JWT auth, rate limiting, input sanitization. Your data is always protected.", color: "#FB923C" },
    { icon: "🏪", title: "Multi-Restaurant", desc: "Run multiple branches from one account. Each restaurant, fully isolated.", color: "#34D399" },
  ];

  const DEMO_STEPS = [
    { label: "Customer scans QR", icon: "📱", desc: "Table has a unique QR code", color: "#FF3008" },
    { label: "Browses digital menu", icon: "🍽️", desc: "Sections, items, prices, tags", color: "#818CF8" },
    { label: "Places order instantly", icon: "⚡", desc: "Name + phone, one tap order", color: "#4ADE80" },
    { label: "Kitchen gets it live", icon: "👨‍🍳", desc: "Zero delays, zero mistakes", color: "#FFC107" },
  ];

  const TESTIMONIALS = [
    { name: "Rajesh Kumar", role: "Owner, Spice Garden Mumbai", text: "Table turnover increased by 40%. Customers love the seamless experience!", rating: 5, emoji: "👨‍🍳" },
    { name: "Priya Sharma", role: "Head Chef, The Hill Bistro", text: "Kitchen display is a game changer. No more shouting orders across the kitchen.", rating: 5, emoji: "👩‍🍳" },
    { name: "Amit Patel", role: "Manager, Pizza Palace Delhi", text: "Setup in under an hour. QR codes on every table. Orders flowing in immediately!", rating: 5, emoji: "🧑‍💼" },
  ];

  return (
    <>
      <Head>
        <title>Platfo — Smart Restaurant Platform</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080808; color: #fff; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #FF3008; }

        @keyframes float { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
        @keyframes floatR { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
        @keyframes typewriter { from { width: 0; } to { width: 100%; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(255,48,8,0.3); } 50% { box-shadow: 0 0 60px rgba(255,48,8,0.6); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes particleFloat { 0% { transform: translateY(100vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100px) rotate(720deg); opacity: 0; } }
        @keyframes numberCount { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderRun { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .hero-title { font-family: 'Syne', sans-serif; }
        .btn-primary { background: #FF3008; color: #fff; padding: 14px 32px; border-radius: 100px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 0 30px rgba(255,48,8,0.4); border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 50px rgba(255,48,8,0.6); }
        .btn-ghost { background: transparent; color: #fff; padding: 14px 32px; border-radius: 100px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); }

        .card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; transition: all 0.3s; }
        .card:hover { border-color: rgba(255,48,8,0.3); transform: translateY(-4px); }

        .glow-text { background: linear-gradient(135deg, #fff 0%, #FF3008 50%, #fff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 4s linear infinite; }

        .nav-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.88rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }

        .feature-tab { padding: 12px 20px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.3s; background: transparent; color: rgba(255,255,255,0.4); font-family: 'Plus Jakarta Sans', sans-serif; }
        .feature-tab.active { background: rgba(255,48,8,0.15); border-color: rgba(255,48,8,0.4); color: #FF3008; }

        .demo-phone { width: 200px; height: 380px; background: #111; border-radius: 32px; border: 8px solid #222; position: relative; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05); animation: float 6s ease-in-out infinite; }
        .demo-phone::before { content: ''; position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background: #333; border-radius: 2px; z-index: 10; }

        .qr-box { width: 100px; height: 100px; background: #fff; border-radius: 12px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; padding: 8px; }
        .qr-cell { border-radius: 1px; }

        .order-badge { animation: slideUp 0.5s ease; }

        .particle { position: absolute; width: 4px; height: 4px; background: #FF3008; border-radius: 50%; animation: particleFloat linear infinite; opacity: 0; }

        .pricing-card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; padding: 36px; transition: all 0.3s; position: relative; overflow: hidden; }
        .pricing-card:hover { transform: translateY(-6px); border-color: rgba(255,48,8,0.3); }
        .pricing-card.featured { border-color: #FF3008; background: linear-gradient(180deg, rgba(255,48,8,0.08) 0%, #111 60%); }
        .pricing-card.featured::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #FF3008, transparent); }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(2.5rem, 10vw, 5rem) !important; letter-spacing: -2px !important; }
          .hero-btns { flex-direction: column; align-items: stretch !important; }
          .hero-btns a, .hero-btns button { text-align: center; justify-content: center; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .demo-section { flex-direction: column !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .demo-phone { width: 160px; height: 300px; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ background: "#080808", minHeight: "100vh" }}>

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{ left: Math.random() * 100 + "%", animationDuration: (8 + i * 2) + "s", animationDelay: (i * 1.2) + "s", width: (3 + i % 3) + "px", height: (3 + i % 3) + "px", opacity: 0 }} />
        ))}

        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrollY > 50 ? "rgba(8,8,8,0.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.3s" }}>
          <a href="/landing" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "34px", height: "34px", background: "#FF3008", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 0 16px rgba(255,48,8,0.5)", animation: "glow 3s ease-in-out infinite" }}>{"🍽️"}</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff" }}>{"Platfo"}</span>
          </a>

          <div className="nav-links-desktop" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {["Features", "How It Works", "Pricing", "Reviews"].map((item) => (
              <a key={item} href={"#" + item.toLowerCase().replace(/ /g, "-")} className="nav-link">{item}</a>
            ))}
          </div>

          <div className="nav-cta-desktop" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <a href="/admin" className="nav-link">{"Sign in"}</a>
            <a href="/signup" className="btn-primary" style={{ padding: "10px 22px", fontSize: "0.85rem" }}>{"Get Started Free →"}</a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem" }} className="hide-desktop">{"☰"}</button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,8,0.98)", zIndex: 99, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px" }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", cursor: "pointer", fontSize: "1.2rem" }}>{"×"}</button>
            {["Features", "How It Works", "Pricing", "Reviews"].map((item) => (
              <a key={item} href={"#" + item.toLowerCase().replace(/ /g, "-")} onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontSize: "1.5rem", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>{item}</a>
            ))}
            <a href="/signup" className="btn-primary">{"Get Started Free →"}</a>
          </div>
        )}

        {/* HERO */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", position: "relative", overflow: "hidden", textAlign: "center" }}>

          {/* Background effects */}
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(255,48,8,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,48,8,0.08)", border: "1px solid rgba(255,48,8,0.25)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, color: "#FF3008", marginBottom: "28px", animation: "slideUp 0.6s ease" }}>
            <div style={{ width: "6px", height: "6px", background: "#FF3008", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            {"✦ India's Smartest Restaurant Platform"}
          </div>

          {/* Title */}
          <h1 className="hero-title" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-3px", marginBottom: "28px", animation: "slideUp 0.6s 0.1s ease both" }}>
            {"Turn Every Table"}
            <br />
            <span className="glow-text">{"Into a Profit"}</span>
            <br />
            {"Machine"}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "rgba(255,255,255,0.45)", maxWidth: "520px", lineHeight: 1.7, marginBottom: "44px", animation: "slideUp 0.6s 0.2s ease both" }}>
            {"QR ordering. Real-time kitchen display. Smart analytics. Everything your restaurant needs — in one beautiful platform."}
          </p>

          {/* CTA Buttons */}
          <div className="hero-btns" style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "slideUp 0.6s 0.3s ease both" }}>
            <a href="/signup" className="btn-primary">
              {"Start Free →"}
            </a>
            <a href="#features" className="btn-ghost">
              {"See Features"}
            </a>
          </div>

          {/* Trust */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "44px", animation: "slideUp 0.6s 0.4s ease both", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex" }}>
              {["👨‍🍳", "👩‍🍳", "🧑‍💼", "👨‍💼", "👩‍💼"].map((e, i) => (
                <div key={i} style={{ width: "32px", height: "32px", background: "#222", border: "2px solid #080808", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", marginLeft: i > 0 ? "-8px" : "0" }}>{e}</div>
              ))}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
              {"Trusted by "}<strong style={{ color: "#fff" }}>{"500+"}</strong>{" restaurants"}
              <span style={{ margin: "0 12px", opacity: 0.2 }}>{"·"}</span>
              <span style={{ color: "#FFC107" }}>{"★★★★★"}</span>
              {" 4.9/5"}
            </div>
          </div>

          {/* Animated Demo Preview */}
          <div style={{ marginTop: "80px", position: "relative", width: "100%", maxWidth: "800px", animation: "slideUp 0.6s 0.5s ease both" }}>

            {/* Main Phone */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "24px" }}>

              {/* Left Card - floating */}
              <div className="hide-mobile" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", width: "160px", animation: "floatR 7s ease-in-out infinite", marginBottom: "40px" }}>
                <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{"New Order"}</div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{"R1-ORD-0047"}</div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "2px" }}>{"Table 5 · 2 items"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                  <div style={{ width: "6px", height: "6px", background: "#FFC107", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: "0.68rem", color: "#FFC107", fontWeight: 600 }}>{"New"}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="demo-phone">
                {/* Phone Screen */}
                <div style={{ position: "absolute", inset: 0, background: "#0A0A0A", overflow: "hidden" }}>

                  {/* Step 0 — QR Scan */}
                  {demoStep === 0 && (
                    <div style={{ padding: "20px", animation: "fadeIn 0.4s ease" }}>
                      <div style={{ fontSize: "0.6rem", color: "#555", marginBottom: "12px", textAlign: "center" }}>{"Scan to order"}</div>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                        <div style={{ width: "90px", height: "90px", background: "#fff", borderRadius: "10px", padding: "6px", display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "1px" }}>
                          {[...Array(81)].map((_, i) => (
                            <div key={i} style={{ background: Math.random() > 0.5 ? "#000" : "#fff", borderRadius: "1px" }} />
                          ))}
                        </div>
                      </div>
                      {/* Scan animation */}
                      <div style={{ position: "absolute", top: "55px", left: "50%", transform: "translateX(-50%)", width: "90px", height: "2px", background: "rgba(255,48,8,0.8)", animation: "scanLine 1.5s ease-in-out infinite", boxShadow: "0 0 10px rgba(255,48,8,0.6)" }} />
                      <div style={{ textAlign: "center", fontSize: "0.55rem", color: "#555" }}>{"Platfo · Table 5"}</div>
                    </div>
                  )}

                  {/* Step 1 — Menu */}
                  {demoStep === 1 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                      <div style={{ background: "#111", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.65rem" }}>{"Spice Garden"}</div>
                        <div style={{ fontSize: "0.5rem", color: "#555", marginTop: "1px" }}>{"Table 5 · Scan & Order"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", padding: "6px", overflowX: "auto" }}>
                        {["Starters", "Main", "Drinks"].map((s, i) => (
                          <div key={s} style={{ background: i === 0 ? "#FF3008" : "rgba(255,255,255,0.06)", color: i === 0 ? "#fff" : "#555", padding: "3px 8px", borderRadius: "20px", fontSize: "0.5rem", fontWeight: 600, whiteSpace: "nowrap" }}>{s}</div>
                        ))}
                      </div>
                      {[{ name: "Paneer Tikka", price: "₹150", tag: "🔥" }, { name: "Veg Spring Roll", price: "₹90" }].map((item) => (
                        <div key={item.name} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "0.58rem", fontWeight: 700 }}>{item.name}{item.tag && " " + item.tag}</div>
                            <div style={{ fontSize: "0.5rem", color: "#FF3008", fontWeight: 700, marginTop: "1px" }}>{item.price}</div>
                          </div>
                          <div style={{ background: "#FF3008", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "0.48rem", fontWeight: 700 }}>{"Add"}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 2 — Order placed */}
                  {demoStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", animation: "fadeIn 0.4s ease" }}>
                      <div style={{ width: "50px", height: "50px", background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "2px solid rgba(74,222,128,0.3)", marginBottom: "12px" }}>{"✅"}</div>
                      <div style={{ fontWeight: 800, fontSize: "0.72rem", marginBottom: "4px" }}>{"Order Placed!"}</div>
                      <div style={{ fontSize: "0.55rem", color: "#555", textAlign: "center" }}>{"Your kitchen is preparing your order"}</div>
                      <div style={{ marginTop: "14px", background: "#111", borderRadius: "8px", padding: "8px 12px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.52rem", marginBottom: "4px" }}>
                          <span style={{ color: "#666" }}>{"Paneer Tikka × 1"}</span>
                          <span>{"₹150"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", fontWeight: 700 }}>
                          <span>{"Total"}</span>
                          <span style={{ color: "#FF3008" }}>{"₹177"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Kitchen */}
                  {demoStep === 3 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                      <div style={{ background: "#111", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.6rem" }}>{"Kitchen Display"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                          <div style={{ width: "4px", height: "4px", background: "#4ADE80", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                          <span style={{ fontSize: "0.48rem", color: "#4ADE80" }}>{"Live"}</span>
                        </div>
                      </div>
                      <div style={{ padding: "8px" }}>
                        {[{ id: "R1-047", table: 5, item: "Paneer Tikka", status: "New", color: "#FFC107" }, { id: "R1-046", table: 3, item: "Dal Makhani", status: "Preparing", color: "#818CF8" }].map((o) => (
                          <div key={o.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "8px", marginBottom: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.55rem", fontWeight: 700 }}>{o.id}</span>
                              <span style={{ fontSize: "0.5rem", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>{"T" + o.table}</span>
                            </div>
                            <div style={{ fontSize: "0.55rem", color: "#888", marginBottom: "5px" }}>{o.item}</div>
                            <div style={{ fontSize: "0.48rem", color: o.color, fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                              <div style={{ width: "4px", height: "4px", background: o.color, borderRadius: "50%" }} />
                              {o.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Card */}
              <div className="hide-mobile" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", width: "160px", animation: "float 8s ease-in-out infinite", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{"Revenue Today"}</div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#4ADE80" }}>{"₹12,840"}</div>
                <div style={{ fontSize: "0.62rem", color: "#555", marginTop: "2px" }}>{"↑ 23% vs yesterday"}</div>
                <div style={{ display: "flex", gap: "2px", marginTop: "10px", alignItems: "flex-end", height: "30px" }}>
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 6 ? "#FF3008" : "rgba(255,48,8,0.2)", borderRadius: "2px", height: h + "%" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Step indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "28px" }}>
              {DEMO_STEPS.map((step, i) => (
                <button key={i} onClick={() => setDemoStep(i)} style={{ padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, background: demoStep === i ? "rgba(255,48,8,0.15)" : "rgba(255,255,255,0.04)", color: demoStep === i ? "#FF3008" : "#444", border: demoStep === i ? "1px solid rgba(255,48,8,0.3)" : "1px solid transparent", transition: "all 0.3s" }}>
                  {step.icon + " " + step.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section ref={statsRef} style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", textAlign: "center" }}>
              {[
                { value: counts.restaurants + "+", label: "Restaurants", color: "#FF3008" },
                { value: counts.orders.toLocaleString() + "+", label: "Orders Processed", color: "#818CF8" },
                { value: counts.uptime + "%", label: "Platform Uptime", color: "#4ADE80" },
                { value: "< 1hr", label: "Setup Time", color: "#FFC107" },
              ].map((stat) => (
                <div key={stat.label} className="reveal" style={{ padding: "24px 16px" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: stat.color, marginBottom: "6px" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }} className="reveal">
            <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>{"✦ Features"}</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "16px" }}>{"Everything you need,"}<br />{"nothing you don't"}</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>{"Built specifically for Indian restaurants. GST-compliant, fast, and beautifully simple."}</p>
          </div>

          {/* Feature tabs */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }} className="reveal">
            {FEATURES.map((f, i) => (
              <button key={i} onClick={() => setActiveFeature(i)} className={"feature-tab" + (activeFeature === i ? " active" : "")}>
                {f.icon + " " + f.title}
              </button>
            ))}
          </div>

          {/* Active feature display */}
          <div className="reveal" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "48px", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "200px" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, " + FEATURES[activeFeature].color + "08 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{FEATURES[activeFeature].icon}</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", color: FEATURES[activeFeature].color }}>{FEATURES[activeFeature].title}</h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{FEATURES[activeFeature].desc}</p>
          </div>

          {/* Feature grid */}
          <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card reveal" onClick={() => setActiveFeature(i)} style={{ padding: "28px", cursor: "pointer", borderColor: activeFeature === i ? "rgba(255,48,8,0.3)" : "rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "14px" }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px" }}>{f.title}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: "100px 24px", background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }} className="reveal">
              <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>{"✦ How It Works"}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-2px" }}>{"Live in under"}<br /><span className="glow-text">{"60 minutes"}</span></h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { num: "01", title: "Sign Up in 2 minutes", desc: "Create your account with email verification. Enter your restaurant name, username and password.", icon: "✍️", color: "#FF3008" },
                { num: "02", title: "Build your digital menu", desc: "Add sections like Starters and Main Course. Add dishes with names, prices and descriptions.", icon: "🍽️", color: "#818CF8" },
                { num: "03", title: "Print QR codes", desc: "Generate unique QR codes for each table from your dashboard. Print and place on tables.", icon: "📱", color: "#4ADE80" },
                { num: "04", title: "Start receiving orders", desc: "Customers scan, order and your kitchen sees it instantly. You're live!", icon: "⚡", color: "#FFC107" },
              ].map((step, i) => (
                <div key={i} className="reveal" style={{ display: "flex", gap: "32px", padding: "40px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "0.65rem", color: step.color, fontWeight: 800, fontFamily: "Syne, sans-serif", minWidth: "30px", paddingTop: "4px", letterSpacing: "1px" }}>{step.num}</div>
                  <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", marginBottom: "8px" }}>{step.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }} className="reveal">
            <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>{"✦ Pricing"}</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-2px", marginBottom: "12px" }}>{"Simple pricing."}<br />{"No surprises."}</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.8rem", color: "#4ADE80", fontWeight: 600 }}>
              {"🎉 Currently FREE for all restaurants!"}
            </div>
          </div>

          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { name: "Starter", price: "₹999", period: "/mo", desc: "Perfect for small restaurants getting started.", color: "#818CF8", features: ["1 Restaurant", "Up to 5 Tables", "20 Menu Items", "QR Ordering", "Basic Dashboard", "Email Support"] },
              { name: "Growth", price: "₹2,499", period: "/mo", desc: "For growing restaurants that need more.", color: "#FF3008", features: ["1 Restaurant", "Up to 20 Tables", "Unlimited Menu Items", "Kitchen Display", "Table History", "GST Receipts", "Priority Support"], featured: true },
              { name: "Pro", price: "₹4,999", period: "/mo", desc: "For restaurant chains and multiple locations.", color: "#4ADE80", features: ["5 Restaurants", "Unlimited Tables", "All Growth Features", "Advanced Analytics", "Custom Branding", "Dedicated Support"] },
            ].map((plan) => (
              <div key={plan.name} className={"pricing-card reveal" + (plan.featured ? " featured" : "")}>
                {plan.featured && (
                  <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: "#FF3008", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "4px 14px", borderRadius: "0 0 8px 8px", letterSpacing: "1px", textTransform: "uppercase" }}>{"Most Popular"}</div>
                )}
                <div style={{ fontSize: "0.72rem", color: plan.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>{plan.name}</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, marginBottom: "4px" }}>{plan.price}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>{plan.period}</span></div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", marginBottom: "28px", lineHeight: 1.5 }}>{plan.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                      <div style={{ width: "16px", height: "16px", background: plan.color + "20", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: plan.color, flexShrink: 0 }}>{"✓"}</div>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="/signup" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", background: plan.featured ? "#FF3008" : "rgba(255,255,255,0.06)", color: "#fff", transition: "all 0.3s", boxShadow: plan.featured ? "0 0 30px rgba(255,48,8,0.3)" : "none" }}>{"Get Started →"}</a>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="reviews" style={{ padding: "100px 24px", background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }} className="reveal">
              <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>{"✦ Reviews"}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-2px" }}>{"Loved by restaurants"}<br />{"across India"}</h2>
            </div>

            <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card reveal" style={{ padding: "28px" }}>
                  <div style={{ color: "#FFC107", fontSize: "0.85rem", marginBottom: "16px", letterSpacing: "2px" }}>{"★★★★★"}</div>
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>{'"' + t.text + '"'}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", background: "rgba(255,48,8,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", border: "1px solid rgba(255,48,8,0.2)" }}>{t.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{t.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,48,8,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.78rem", color: "#4ADE80", fontWeight: 600, marginBottom: "28px" }}>
              {"🎉 100% Free to get started"}
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 800, letterSpacing: "-3px", marginBottom: "20px", lineHeight: 0.95 }}>
              {"Ready to transform"}<br />
              <span className="glow-text">{"your restaurant?"}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", maxWidth: "420px", margin: "0 auto 40px", lineHeight: 1.7 }}>
              {"Join hundreds of restaurants already using Platfo. Setup takes less than an hour."}
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/signup" className="btn-primary" style={{ fontSize: "1rem", padding: "16px 36px" }}>{"Start Free — No Card Needed →"}</a>
              <a href="/admin" className="btn-ghost" style={{ fontSize: "1rem", padding: "16px 36px" }}>{"Sign In"}</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 24px 32px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", background: "#FF3008", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>{"🍽️"}</div>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>{"Platfo"}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "280px" }}>{"The smart restaurant platform that helps you manage orders, delight customers and grow your business."}</p>
              </div>
              {[
                { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                { title: "Legal", links: ["Privacy", "Terms", "Refund Policy"] },
              ].map((col) => (
                <div key={col.title}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.links.map((link) => (
                      <a key={link} href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#fff"} onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}>{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>{"© 2026 Platfo. All rights reserved."}</p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>{"Made with ❤️ in India"}</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

 

