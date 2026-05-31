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

  useEffect(() => {
    const interval = setInterval(() => setDemoStep((prev) => (prev + 1) % 4), 2600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((prev) => (prev + 1) % 7), 3000);
    return () => clearInterval(interval);
  }, []);

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

  const animateCount = (target, setter) => {
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setter(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 24);
  };

  const FEATURES = [
    { icon: "📱", title: "QR Code Ordering", desc: "Customers scan, browse and order from their phones. Zero app downloads. Zero friction.", color: "#FF3008" },
    { icon: "🤖", title: "AI Menu Assistant", desc: "Customers ask questions about your menu and get instant AI-powered answers. Suggests dishes, handles dietary queries, increases order value.", color: "#818CF8", isNew: true },
    { icon: "👨‍🍳", title: "Kitchen Display", desc: "Real-time order management. New, Preparing, Ready — your kitchen always knows.", color: "#4ADE80" },
    { icon: "📊", title: "Smart Dashboard", desc: "Track orders, revenue and performance. Filter by date. Download CSV reports.", color: "#FFC107" },
    { icon: "🧾", title: "GST Receipts", desc: "Auto-generate professional receipts with CGST & SGST breakdown. Print with one click.", color: "#FB923C" },
    { icon: "📦", title: "Inventory Tracking", desc: "Auto-deducts stock when orders are placed. Low stock alerts so you never run out.", color: "#34D399" },
    { icon: "🔒", title: "Bank-Grade Security", desc: "JWT auth, rate limiting, input sanitization. Your data is always protected.", color: "#F472B6" },
  ];

  const DEMO_STEPS = [
    { label: "Customer scans QR", icon: "📱", color: "#FF3008" },
    { label: "Browses digital menu", icon: "🍽️", color: "#818CF8" },
    { label: "Places order instantly", icon: "⚡", color: "#4ADE80" },
    { label: "Kitchen gets it live", icon: "👨‍🍳", color: "#FFC107" },
  ];

  const TESTIMONIALS = [
    { name: "Rajesh Kumar", role: "Owner, Spice Garden Mumbai", text: "Table turnover increased by 40%. Customers love the seamless ordering experience!", rating: 5, emoji: "👨‍🍳" },
    { name: "Priya Sharma", role: "Head Chef, The Hill Bistro", text: "Kitchen display is a game changer. No more shouting orders across the kitchen.", rating: 5, emoji: "👩‍🍳" },
    { name: "Amit Patel", role: "Manager, Pizza Palace Delhi", text: "Setup in under an hour. QR codes on every table. The AI assistant handles all menu questions!", rating: 5, emoji: "🧑‍💼" },
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

        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        @keyframes floatR { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(255,48,8,0.3); } 50% { box-shadow: 0 0 60px rgba(255,48,8,0.7); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes particleFloat { 0% { transform: translateY(100vh); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100px); opacity: 0; } }
        @keyframes scanLine { 0% { top: 8%; } 100% { top: 88%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes aiPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(129,140,248,0.3); } 50% { box-shadow: 0 0 0 8px rgba(129,140,248,0); } }

        .hero-title { font-family: 'Syne', sans-serif; }
        .btn-primary { background: #FF3008; color: #fff; padding: 14px 32px; border-radius: 100px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 0 30px rgba(255,48,8,0.4); border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 50px rgba(255,48,8,0.6); }
        .btn-ghost { background: transparent; color: #fff; padding: 14px 32px; border-radius: 100px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); }
        .card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; transition: all 0.3s; }
        .card:hover { border-color: rgba(255,48,8,0.3); transform: translateY(-4px); }
        .glow-text { background: linear-gradient(135deg, #fff 0%, #FF3008 50%, #fff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 4s linear infinite; }
        .ai-text { background: linear-gradient(135deg, #a78bfa, #818CF8, #a78bfa); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 3s linear infinite; }
        .nav-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.88rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .feature-tab { padding: 10px 18px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s; background: transparent; color: rgba(255,255,255,0.4); font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap; }
        .feature-tab.active { background: rgba(255,48,8,0.15); border-color: rgba(255,48,8,0.4); color: #FF3008; }
        .feature-tab.active-ai { background: rgba(129,140,248,0.15); border-color: rgba(129,140,248,0.4); color: #818CF8; }
        .demo-phone { width: 200px; height: 390px; background: #111; border-radius: 34px; border: 8px solid #1a1a1a; position: relative; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.03); animation: float 6s ease-in-out infinite; }
        .demo-phone::before { content: ''; position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 56px; height: 4px; background: #2a2a2a; border-radius: 2px; z-index: 10; }
        .particle { position: absolute; width: 3px; height: 3px; background: #FF3008; border-radius: 50%; animation: particleFloat linear infinite; opacity: 0; }
        .pricing-card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; padding: 36px; transition: all 0.3s; position: relative; overflow: hidden; }
        .pricing-card:hover { transform: translateY(-6px); border-color: rgba(255,48,8,0.3); }
        .new-badge { background: linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.2)); border: 1px solid rgba(129,140,248,0.4); color: #a78bfa; font-size: 0.6rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(2.5rem, 10vw, 5rem) !important; letter-spacing: -2px !important; }
          .hero-btns { flex-direction: column; align-items: stretch !important; }
          .hero-btns a { text-align: center; justify-content: center; }
          .feature-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .demo-phone { width: 160px; height: 310px; }
          .hide-mobile { display: none !important; }
          .ai-banner { flex-direction: column !important; text-align: center; }
        }
      `}</style>

      <div style={{ background: "#080808", minHeight: "100vh" }}>

        {/* Particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{ left: (i * 13 + 4) + "%", animationDuration: (9 + i * 1.5) + "s", animationDelay: (i * 1.1) + "s", opacity: 0 }} />
        ))}

        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrollY > 50 ? "rgba(8,8,8,0.96)" : "transparent", backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.3s" }}>
          <a href="/landing" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "34px", height: "34px", background: "#FF3008", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", animation: "glow 3s ease-in-out infinite" }}>{"🍽️"}</div>
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

          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", display: "none" }} className="hide-desktop">{"☰"}</button>
        </nav>

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

          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(255,48,8,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />

          {/* NEW — AI Feature Announcement Banner */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, rgba(129,140,248,0.12), rgba(167,139,250,0.08))", border: "1px solid rgba(129,140,248,0.35)", borderRadius: "100px", padding: "8px 18px", fontSize: "0.78rem", fontWeight: 700, color: "#a78bfa", marginBottom: "20px", animation: "slideUp 0.5s ease" }}>
            <span style={{ background: "rgba(129,140,248,0.25)", borderRadius: "6px", padding: "2px 7px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>{"NEW"}</span>
            {"🤖 AI Menu Assistant — now live on every restaurant!"}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,48,8,0.08)", border: "1px solid rgba(255,48,8,0.25)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, color: "#FF3008", marginBottom: "28px", animation: "slideUp 0.6s 0.05s ease both" }}>
            <div style={{ width: "6px", height: "6px", background: "#FF3008", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            {"✦ India's Smartest Restaurant Platform"}
          </div>

          <h1 className="hero-title" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-3px", marginBottom: "28px", animation: "slideUp 0.6s 0.1s ease both" }}>
            {"Turn Every Table"}
            <br />
            <span className="glow-text">{"Into a Profit"}</span>
            <br />
            {"Machine"}
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "rgba(255,255,255,0.45)", maxWidth: "560px", lineHeight: 1.7, marginBottom: "44px", animation: "slideUp 0.6s 0.2s ease both" }}>
            {"QR ordering. AI-powered menu assistant. Real-time kitchen display. Smart analytics. Everything your restaurant needs — in one platform."}
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "slideUp 0.6s 0.3s ease both" }}>
            <a href="/signup" className="btn-primary">{"Start Free →"}</a>
            <a href="#features" className="btn-ghost">{"See Features"}</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "44px", animation: "slideUp 0.6s 0.4s ease both", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex" }}>
              {["👨‍🍳", "👩‍🍳", "🧑‍💼", "👨‍💼", "👩‍💼"].map((e, i) => (
                <div key={i} style={{ width: "32px", height: "32px", background: "#1e1e1e", border: "2px solid #080808", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", marginLeft: i > 0 ? "-8px" : "0" }}>{e}</div>
              ))}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
              {"Trusted by "}<strong style={{ color: "#fff" }}>{"500+"}</strong>{" restaurants"}
              <span style={{ margin: "0 12px", opacity: 0.2 }}>{"·"}</span>
              <span style={{ color: "#FFC107" }}>{"★★★★★"}</span>
              {" 4.9/5"}
            </div>
          </div>

          {/* Demo Phone */}
          <div style={{ marginTop: "80px", position: "relative", width: "100%", maxWidth: "820px", animation: "slideUp 0.6s 0.5s ease both" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "28px" }}>

              <div className="hide-mobile" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px", width: "168px", animation: "floatR 7s ease-in-out infinite", marginBottom: "44px" }}>
                <div style={{ fontSize: "0.62rem", color: "#444", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{"New Order"}</div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{"R1-ORD-0047"}</div>
                <div style={{ fontSize: "0.72rem", color: "#666", marginTop: "2px" }}>{"Table 5 · 2 items"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                  <div style={{ width: "6px", height: "6px", background: "#FFC107", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: "0.68rem", color: "#FFC107", fontWeight: 600 }}>{"New"}</span>
                </div>
              </div>

              <div className="demo-phone">
                <div style={{ position: "absolute", inset: 0, background: "#0A0A0A", overflow: "hidden" }}>
                  {demoStep === 0 && (
                    <div style={{ padding: "22px 18px", animation: "fadeIn 0.4s ease" }}>
                      <div style={{ fontSize: "0.58rem", color: "#444", marginBottom: "14px", textAlign: "center" }}>{"Scan to order"}</div>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px", position: "relative" }}>
                        <div style={{ width: "88px", height: "88px", background: "#fff", borderRadius: "10px", padding: "6px", display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "1px" }}>
                          {[...Array(81)].map((_, i) => (<div key={i} style={{ background: Math.sin(i * 7.3) > 0 ? "#000" : "#fff", borderRadius: "1px" }} />))}
                        </div>
                        <div style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "88px", height: "2px", background: "rgba(255,48,8,0.8)", animation: "scanLine 1.5s ease-in-out infinite", boxShadow: "0 0 8px rgba(255,48,8,0.7)" }} />
                      </div>
                      <div style={{ textAlign: "center", fontSize: "0.52rem", color: "#444" }}>{"Platfo · Table 5"}</div>
                    </div>
                  )}
                  {demoStep === 1 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                      <div style={{ background: "#111", padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.63rem" }}>{"Spice Garden"}</div>
                        <div style={{ fontSize: "0.48rem", color: "#444", marginTop: "1px" }}>{"Table 5 · Scan & Order"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", padding: "6px 8px" }}>
                        {["Starters", "Main", "Drinks"].map((s, i) => (
                          <div key={s} style={{ background: i === 0 ? "#FF3008" : "rgba(255,255,255,0.06)", color: i === 0 ? "#fff" : "#555", padding: "3px 8px", borderRadius: "20px", fontSize: "0.47rem", fontWeight: 600, whiteSpace: "nowrap" }}>{s}</div>
                        ))}
                      </div>
                      {[{ name: "Paneer Tikka", price: "₹150", tag: "🔥" }, { name: "Veg Spring Roll", price: "₹90" }, { name: "Dal Makhani", price: "₹120" }].map((item) => (
                        <div key={item.name} style={{ padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "0.56rem", fontWeight: 700 }}>{item.name}{item.tag && " " + item.tag}</div>
                            <div style={{ fontSize: "0.48rem", color: "#FF3008", fontWeight: 700, marginTop: "1px" }}>{item.price}</div>
                          </div>
                          <div style={{ background: "#FF3008", color: "#fff", padding: "3px 7px", borderRadius: "5px", fontSize: "0.46rem", fontWeight: 700 }}>{"Add"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {demoStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", animation: "fadeIn 0.4s ease" }}>
                      <div style={{ width: "52px", height: "52px", background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", border: "2px solid rgba(74,222,128,0.3)", marginBottom: "14px" }}>{"✅"}</div>
                      <div style={{ fontWeight: 800, fontSize: "0.72rem", marginBottom: "4px" }}>{"Order Placed!"}</div>
                      <div style={{ fontSize: "0.52rem", color: "#555", textAlign: "center" }}>{"Kitchen is preparing your order"}</div>
                      <div style={{ marginTop: "14px", background: "#111", borderRadius: "8px", padding: "8px 12px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5rem", marginBottom: "4px" }}>
                          <span style={{ color: "#555" }}>{"Paneer Tikka × 1"}</span><span>{"₹150"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.54rem", fontWeight: 700 }}>
                          <span>{"Total"}</span><span style={{ color: "#FF3008" }}>{"₹177"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {demoStep === 3 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                      <div style={{ background: "#111", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.6rem" }}>{"Kitchen Display"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                          <div style={{ width: "4px", height: "4px", background: "#4ADE80", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                          <span style={{ fontSize: "0.46rem", color: "#4ADE80" }}>{"Live"}</span>
                        </div>
                      </div>
                      <div style={{ padding: "8px" }}>
                        {[{ id: "R1-047", table: 5, item: "Paneer Tikka", status: "New", color: "#FFC107" }, { id: "R1-046", table: 3, item: "Dal Makhani", status: "Preparing", color: "#818CF8" }].map((o) => (
                          <div key={o.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "8px", marginBottom: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                              <span style={{ fontSize: "0.53rem", fontWeight: 700 }}>{o.id}</span>
                              <span style={{ fontSize: "0.48rem", background: "rgba(255,255,255,0.06)", padding: "1px 4px", borderRadius: "3px" }}>{"T" + o.table}</span>
                            </div>
                            <div style={{ fontSize: "0.53rem", color: "#666", marginBottom: "4px" }}>{o.item}</div>
                            <div style={{ fontSize: "0.46rem", color: o.color, fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                              <div style={{ width: "4px", height: "4px", background: o.color, borderRadius: "50%" }} />{o.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="hide-mobile" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px", width: "168px", animation: "float 8s ease-in-out infinite", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.62rem", color: "#444", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{"Revenue Today"}</div>
                <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "#4ADE80" }}>{"₹12,840"}</div>
                <div style={{ fontSize: "0.62rem", color: "#555", marginTop: "2px" }}>{"↑ 23% vs yesterday"}</div>
                <div style={{ display: "flex", gap: "2px", marginTop: "10px", alignItems: "flex-end", height: "30px" }}>
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 6 ? "#FF3008" : "rgba(255,48,8,0.2)", borderRadius: "2px", height: h + "%" }} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "28px", flexWrap: "wrap" }}>
              {DEMO_STEPS.map((step, i) => (
                <button key={i} onClick={() => setDemoStep(i)} style={{ padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.72rem", fontWeight: 600, background: demoStep === i ? "rgba(255,48,8,0.15)" : "rgba(255,255,255,0.04)", color: demoStep === i ? "#FF3008" : "#444", border: demoStep === i ? "1px solid rgba(255,48,8,0.3)" : "1px solid transparent", transition: "all 0.3s" }}>
                  {step.icon + " " + step.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI FEATURE BANNER */}
        <section style={{ padding: "0 24px 0", maxWidth: "1100px", margin: "0 auto" }}>
          <div className="ai-banner reveal" style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(167,139,250,0.05) 100%)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "20px", padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
              <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.2))", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, border: "1px solid rgba(129,140,248,0.3)", animation: "aiPulse 2.5s infinite" }}>{"🤖"}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>{"AI Menu Assistant"}</span>
                  <span style={{ background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.4)", color: "#a78bfa", fontSize: "0.6rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{"NEW"}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                  {"Every restaurant on Platfo now gets an AI assistant that knows their menu. Customers ask questions, get instant answers — "}
                  <span style={{ color: "#a78bfa", fontWeight: 600 }}>{"powered by Claude AI."}</span>
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px", flexShrink: 0, flexWrap: "wrap" }}>
              {[
                { label: "Multilingual", icon: "🌍" },
                { label: "Dietary Queries", icon: "🥗" },
                { label: "Recommendations", icon: "⭐" },
                { label: "< 2 sec response", icon: "⚡" },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: "3px" }}>{item.icon}</div>
                  <div style={{ fontSize: "0.65rem", color: "#a78bfa", fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section ref={statsRef} style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "60px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>{"Built for Indian restaurants. GST-compliant, AI-powered, beautifully simple."}</p>
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }} className="reveal">
            {FEATURES.map((f, i) => (
              <button key={i} onClick={() => setActiveFeature(i)} className={"feature-tab" + (activeFeature === i ? (i === 1 ? " active-ai" : " active") : "")}>
                {f.icon + " " + f.title}
                {f.isNew && <span className="new-badge" style={{ marginLeft: "4px" }}>{"NEW"}</span>}
              </button>
            ))}
          </div>

          <div className="reveal" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "48px", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "200px" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, " + FEATURES[activeFeature].color + "10 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{FEATURES[activeFeature].icon}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: FEATURES[activeFeature].color }}>{FEATURES[activeFeature].title}</h3>
              {FEATURES[activeFeature].isNew && <span className="new-badge">{"NEW"}</span>}
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{FEATURES[activeFeature].desc}</p>
          </div>

          <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card reveal" onClick={() => setActiveFeature(i)} style={{ padding: "28px", cursor: "pointer", borderColor: activeFeature === i ? (i === 1 ? "rgba(129,140,248,0.4)" : "rgba(255,48,8,0.3)") : "rgba(255,255,255,0.07)", position: "relative" }}>
                {f.isNew && <div style={{ position: "absolute", top: "14px", right: "14px" }} className="new-badge">{"NEW"}</div>}
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { num: "01", title: "Sign Up in 2 minutes", desc: "Create your account with email verification. Enter your restaurant name, username and password.", icon: "✍️", color: "#FF3008" },
                { num: "02", title: "Build your digital menu", desc: "Add sections like Starters and Main Course. Add dishes with names, prices and descriptions.", icon: "🍽️", color: "#818CF8" },
                { num: "03", title: "AI assistant is ready instantly", desc: "Your AI menu bot is automatically trained on your menu. Customers can ask questions in any language immediately.", icon: "🤖", color: "#a78bfa", isNew: true },
                { num: "04", title: "Print QR codes", desc: "Generate unique QR codes for each table from your dashboard. Print and place on tables.", icon: "📱", color: "#4ADE80" },
                { num: "05", title: "Start receiving orders", desc: "Customers scan, browse, ask the AI, order — and your kitchen sees it instantly. You're live!", icon: "⚡", color: "#FFC107" },
              ].map((step, i) => (
                <div key={i} className="reveal" style={{ display: "flex", gap: "32px", padding: "40px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "0.65rem", color: step.color, fontWeight: 800, fontFamily: "Syne, sans-serif", minWidth: "30px", paddingTop: "4px", letterSpacing: "1px" }}>{step.num}</div>
                  <div style={{ width: "48px", height: "48px", background: step.isNew ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.04)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, border: step.isNew ? "1px solid rgba(129,140,248,0.2)" : "none" }}>{step.icon}</div>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                      {step.title}
                      {step.isNew && <span className="new-badge">{"AI"}</span>}
                    </div>
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
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>{"One plan. All features including AI. Pay less when you commit longer."}</p>
          </div>

          <div className="reveal" style={{ background: "rgba(255,48,8,0.06)", border: "1px solid rgba(255,48,8,0.15)", borderRadius: "16px", padding: "20px 28px", marginBottom: "40px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{"✦ Every plan includes:"}</span>
            {["QR Code Ordering", "🤖 AI Menu Assistant", "Kitchen Display", "Dashboard", "GST Receipts", "Inventory Tracking", "Unlimited Orders"].map((f) => (
              <span key={f} style={{ background: f.includes("🤖") ? "rgba(129,140,248,0.1)" : "rgba(255,255,255,0.04)", border: f.includes("🤖") ? "1px solid rgba(129,140,248,0.25)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "4px 12px", fontSize: "0.75rem", color: f.includes("🤖") ? "#a78bfa" : "rgba(255,255,255,0.5)", fontWeight: f.includes("🤖") ? 600 : 400 }}>{f}</span>
            ))}
          </div>

          <div className="pricing-grid reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>

            <div className="pricing-card">
              <div style={{ fontSize: "0.72rem", color: "#818CF8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>{"Monthly"}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.8rem", fontWeight: 800, marginBottom: "4px", letterSpacing: "-2px" }}>{"₹1,299"}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>{"/mo"}</span></div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: "8px", padding: "4px 10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "#818CF8", fontWeight: 600 }}>{"🗓 28 days per cycle"}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "28px", lineHeight: 1.5 }}>{"Perfect for restaurants starting out."}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {["All Platform Features", "🤖 AI Menu Assistant", "Unlimited Orders", "Up to 50 Tables", "GST Receipts", "Email Support"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: f.includes("🤖") ? "#a78bfa" : "rgba(255,255,255,0.55)", fontWeight: f.includes("🤖") ? 600 : 400 }}>
                    <div style={{ width: "16px", height: "16px", background: f.includes("🤖") ? "rgba(129,140,248,0.15)" : "rgba(129,140,248,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", color: "#818CF8", flexShrink: 0 }}>{"✓"}</div>
                    {f}
                  </div>
                ))}
              </div>
              <a href="/signup" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", background: "rgba(129,140,248,0.12)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.25)", transition: "all 0.3s" }}>{"Get Started →"}</a>
            </div>

            <div style={{ background: "linear-gradient(180deg, rgba(255,48,8,0.08) 0%, #111 60%)", border: "1px solid #FF3008", borderRadius: "24px", padding: "36px", transition: "all 0.3s", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, #FF3008, transparent)" }} />
              <div style={{ position: "absolute", top: "-1px", right: "24px", background: "#FF3008", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "5px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "1px", textTransform: "uppercase" }}>{"Most Popular"}</div>
              <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>{"6 Months"}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.8rem", fontWeight: 800, marginBottom: "4px", letterSpacing: "-2px" }}>{"₹1,099"}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>{"/mo"}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }}>{"₹7,794"}</span>
                <span style={{ background: "rgba(255,48,8,0.15)", color: "#FF3008", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>{"Save ₹1,194"}</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,48,8,0.08)", border: "1px solid rgba(255,48,8,0.2)", borderRadius: "8px", padding: "4px 10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 600 }}>{"🗓 168 days · ₹6,594 total"}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "28px", lineHeight: 1.5 }}>{"Best value for growing restaurants."}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {["All Platform Features", "🤖 AI Menu Assistant", "Unlimited Orders", "Up to 50 Tables", "GST Receipts", "Priority Support", "Early Feature Access"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: f.includes("🤖") ? "#a78bfa" : "rgba(255,255,255,0.55)", fontWeight: f.includes("🤖") ? 600 : 400 }}>
                    <div style={{ width: "16px", height: "16px", background: f.includes("🤖") ? "rgba(129,140,248,0.15)" : "rgba(255,48,8,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", color: "#FF3008", flexShrink: 0 }}>{"✓"}</div>
                    {f}
                  </div>
                ))}
              </div>
              <a href="/signup" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", background: "#FF3008", color: "#fff", boxShadow: "0 0 30px rgba(255,48,8,0.35)", transition: "all 0.3s" }}>{"Get Started →"}</a>
            </div>

            <div className="pricing-card">
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ADE80", fontSize: "0.65rem", fontWeight: 700, padding: "3px 10px", borderRadius: "6px" }}>{"Best Deal"}</div>
              <div style={{ fontSize: "0.72rem", color: "#4ADE80", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>{"12 Months"}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2.8rem", fontWeight: 800, marginBottom: "4px", letterSpacing: "-2px" }}>{"₹859"}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>{"/mo"}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }}>{"₹15,588"}</span>
                <span style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>{"Save ₹5,280"}</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "8px", padding: "4px 10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "#4ADE80", fontWeight: 600 }}>{"🗓 336 days · ₹10,308 total"}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "28px", lineHeight: 1.5 }}>{"Maximum savings for established restaurants."}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                {["All Platform Features", "🤖 AI Menu Assistant", "Unlimited Orders", "Up to 50 Tables", "GST Receipts", "Dedicated Support", "Free Setup Assistance"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: f.includes("🤖") ? "#a78bfa" : "rgba(255,255,255,0.55)", fontWeight: f.includes("🤖") ? 600 : 400 }}>
                    <div style={{ width: "16px", height: "16px", background: f.includes("🤖") ? "rgba(129,140,248,0.15)" : "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", color: "#4ADE80", flexShrink: 0 }}>{"✓"}</div>
                    {f}
                  </div>
                ))}
              </div>
              <a href="/signup" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)", transition: "all 0.3s" }}>{"Get Started →"}</a>
            </div>

          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: "28px" }}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>{"All prices exclusive of GST · Payments via Razorpay · Cancel anytime on monthly plan"}</p>
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
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,48,8,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.78rem", color: "#4ADE80", fontWeight: 600 }}>
                {"🎉 100% Free to get started"}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "0.78rem", color: "#a78bfa", fontWeight: 600 }}>
                {"🤖 AI bot included in all plans"}
              </div>
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 800, letterSpacing: "-3px", marginBottom: "20px", lineHeight: 0.95 }}>
              {"Ready to transform"}<br />
              <span className="glow-text">{"your restaurant?"}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", maxWidth: "420px", margin: "0 auto 40px", lineHeight: 1.7 }}>
              {"Join hundreds of restaurants already using Platfo. QR ordering, AI assistant, kitchen display — all live in under an hour."}
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
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "280px" }}>{"Smart restaurant platform with AI. QR ordering, kitchen display, analytics and an AI menu assistant."}</p>
                <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
                  <span style={{ fontSize: "0.68rem", color: "#a78bfa", fontWeight: 600 }}>{"🤖 AI powered by Anthropic"}</span>
                </div>
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
                      <a key={link} href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}
                        onMouseOver={(e) => e.target.style.color = "#fff"}
                        onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}>{link}</a>
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
