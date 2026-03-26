import Head from "next/head";
import { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".fade-up").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
      el.style.transition = "all 0.7s ease";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div suppressHydrationWarning>
      <Head>
        <title>{"Platfo — Smart Restaurant Platform"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #0A0A0A; color: #fff; overflow-x: hidden; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .nav-logo { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: -1px; }
        .nav-logo span { color: #FF3008; }
        .nav-links { display: flex; gap: 40px; list-style: none; }
        .nav-links a { color: #888; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: #fff; }
        .nav-cta { background: #FF3008 !important; color: #fff !important; padding: 10px 24px; border-radius: 100px; font-weight: 600 !important; box-shadow: 0 0 20px rgba(255,48,8,0.3); }
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 40px 80px; position: relative; overflow: hidden; text-align: center; }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,48,8,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,48,8,0.08) 0%, transparent 50%); }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,48,8,0.1); border: 1px solid rgba(255,48,8,0.3); border-radius: 100px; padding: 8px 20px; font-size: 0.8rem; font-weight: 500; color: #FF3008; margin-bottom: 32px; letter-spacing: 1px; text-transform: uppercase; animation: fadeUp 0.6s ease both; position: relative; z-index: 1; }
        .hero-badge::before { content: ''; width: 6px; height: 6px; background: #FF3008; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(3rem, 8vw, 7rem); font-weight: 800; line-height: 0.95; letter-spacing: -3px; margin-bottom: 28px; animation: fadeUp 0.6s 0.1s ease both; position: relative; z-index: 1; }
        .hero-title .line2 { display: block; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.3); }
        .hero-title .accent { color: #FF3008; }
        .hero-desc { font-size: clamp(1rem, 2vw, 1.2rem); color: #888; max-width: 540px; line-height: 1.7; margin-bottom: 48px; animation: fadeUp 0.6s 0.2s ease both; position: relative; z-index: 1; }
        .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.6s 0.3s ease both; position: relative; z-index: 1; }
        .btn-primary { background: #FF3008; color: #fff; padding: 18px 40px; border-radius: 100px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 0 40px rgba(255,48,8,0.4); display: inline-flex; align-items: center; gap: 10px; }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 60px rgba(255,48,8,0.6); }
        .btn-secondary { background: transparent; color: #fff; padding: 18px 40px; border-radius: 100px; font-size: 1rem; font-weight: 500; text-decoration: none; border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        .float-el { position: absolute; border-radius: 50%; pointer-events: none; }
        .float-1 { top: 20%; right: 5%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,48,8,0.15) 0%, transparent 70%); animation: float 6s ease-in-out infinite; }
        .float-2 { bottom: 20%; left: 5%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,48,8,0.08) 0%, transparent 70%); animation: float 8s ease-in-out infinite reverse; }
        .section { padding: 120px 40px; max-width: 1200px; margin: 0 auto; }
        .section-tag { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #FF3008; margin-bottom: 16px; display: block; }
        .section-title { font-family: 'Syne', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px; }
        .section-desc { color: #888; font-size: 1.1rem; line-height: 1.7; max-width: 500px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 60px; }
        .feature-card { background: #1A1A1A; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 32px; transition: all 0.3s; position: relative; overflow: hidden; }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,48,8,0.5), transparent); opacity: 0; transition: opacity 0.3s; }
        .feature-card:hover { border-color: rgba(255,48,8,0.2); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon { width: 52px; height: 52px; background: rgba(255,48,8,0.1); border: 1px solid rgba(255,48,8,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 20px; }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
        .feature-desc { font-size: 0.88rem; color: #888; line-height: 1.6; }
        .how-section { padding: 120px 40px; background: #1A1A1A; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .how-inner { max-width: 1200px; margin: 0 auto; }
        .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 60px; position: relative; }
        .steps-grid::before { content: ''; position: absolute; top: 32px; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,48,8,0.4), transparent); }
        .step-card { text-align: center; }
        .step-num { width: 64px; height: 64px; background: #111; border: 2px solid rgba(255,48,8,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; color: #FF3008; margin: 0 auto 20px; position: relative; z-index: 1; box-shadow: 0 0 30px rgba(255,48,8,0.2); }
        .step-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
        .step-desc { font-size: 0.85rem; color: #888; line-height: 1.6; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
        .pricing-card { background: #1A1A1A; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 32px; transition: all 0.3s; position: relative; }
        .pricing-card.popular { border-color: #FF3008; background: linear-gradient(180deg, rgba(255,48,8,0.08) 0%, #1A1A1A 100%); transform: scale(1.03); }
        .popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #FF3008; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 5px 16px; border-radius: 100px; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; }
        .pricing-plan { font-size: 0.8rem; font-weight: 600; color: #FF3008; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
        .pricing-price { font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
        .pricing-price span { font-size: 1.2rem; color: #888; font-weight: 400; }
        .pricing-desc { font-size: 0.88rem; color: #888; margin-bottom: 32px; line-height: 1.6; }
        .pricing-features { list-style: none; margin-bottom: 36px; display: flex; flex-direction: column; gap: 12px; }
        .pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: #888; }
        .pricing-features li::before { content: '✓'; color: #FF3008; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
        .pricing-btn { width: 100%; padding: 16px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.3s; text-decoration: none; display: block; text-align: center; font-family: 'DM Sans', sans-serif; }
        .pricing-btn-primary { background: #FF3008; color: #fff; box-shadow: 0 0 30px rgba(255,48,8,0.3); }
        .pricing-btn-primary:hover { box-shadow: 0 0 50px rgba(255,48,8,0.5); transform: translateY(-2px); }
        .pricing-btn-secondary { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.15) !important; }
        .pricing-btn-secondary:hover { background: rgba(255,255,255,0.05); }
        .testimonials-section { padding: 120px 40px; background: #1A1A1A; border-top: 1px solid rgba(255,255,255,0.05); }
        .testimonials-inner { max-width: 1200px; margin: 0 auto; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
        .testimonial-card { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .testimonial-card:hover { border-color: rgba(255,48,8,0.2); transform: translateY(-4px); }
        .testimonial-stars { color: #FF3008; font-size: 0.9rem; margin-bottom: 16px; letter-spacing: 2px; }
        .testimonial-text { font-size: 0.95rem; line-height: 1.7; color: rgba(255,255,255,0.8); margin-bottom: 20px; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; background: rgba(255,48,8,0.1); border: 1px solid rgba(255,48,8,0.2); }
        .author-name { font-weight: 600; font-size: 0.9rem; color: #fff; }
        .author-role { font-size: 0.78rem; color: #888; margin-top: 2px; }
        .cta-section { padding: 120px 40px; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,48,8,0.12) 0%, transparent 70%); pointer-events: none; }
        .cta-inner { position: relative; z-index: 1; }
        .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; letter-spacing: -3px; line-height: 1; margin-bottom: 24px; }
        .cta-desc { color: #888; font-size: 1.1rem; margin-bottom: 48px; max-width: 500px; margin-left: auto; margin-right: auto; }
        footer { background: #1A1A1A; border-top: 1px solid rgba(255,255,255,0.05); padding: 60px 40px 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .footer-brand p { color: #888; font-size: 0.88rem; line-height: 1.7; margin-top: 16px; max-width: 280px; }
        .footer-col h4 { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; margin-bottom: 20px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .footer-col ul li a { color: #888; text-decoration: none; font-size: 0.88rem; transition: color 0.3s; }
        .footer-col ul li a:hover { color: #fff; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .footer-bottom p { color: #888; font-size: 0.82rem; }
        @media (max-width: 900px) {
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 20px 60px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid::before { display: none; }
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-card.popular { transform: scale(1); }
          .testimonials-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 40px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .section { padding: 80px 20px; }
          .how-section { padding: 80px 20px; }
          .cta-section { padding: 80px 20px; }
          .testimonials-section { padding: 80px 20px; }
          footer { padding: 60px 20px 40px; }
        }
        @media (max-width: 600px) {
          .footer-inner { grid-template-columns: 1fr; }
          .hero-buttons { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav" suppressHydrationWarning>
        <div className="nav-logo">{"Plat"}<span>{"fo"}</span></div>
        <ul className="nav-links">
          <li><a href="#features">{"Features"}</a></li>
          <li><a href="#how">{"How It Works"}</a></li>
          <li><a href="#pricing">{"Pricing"}</a></li>
          <li><a href="#testimonials">{"Reviews"}</a></li>
          <li><a href="/signup" className="nav-cta">{"Get Started Free"}</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" suppressHydrationWarning>
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="float-el float-1"></div>
        <div className="float-el float-2"></div>
        <div className="hero-badge">{"✦ The Future of Restaurant Management"}</div>
        <h1 className="hero-title">
          {"Smart Dining"}
          <span className="line2">{"Starts With"}</span>
          <span className="accent">{" Platfo"}</span>
        </h1>
        <p className="hero-desc">
          {"The all-in-one QR-based restaurant platform. Let customers order from their phones, manage your kitchen in real-time, and grow your business — all from one dashboard."}
        </p>
        <div className="hero-buttons">
          <a href="/signup" className="btn-primary">{"Start Free Trial →"}</a>
          <a href="#how" className="btn-secondary">{"See How It Works"}</a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features" suppressHydrationWarning>
        <div className="fade-up">
          <span className="section-tag">{"✦ Features"}</span>
          <h2 className="section-title">{"Everything your restaurant needs to thrive"}</h2>
          <p className="section-desc">{"From QR ordering to kitchen display systems — Platfo handles it all."}</p>
        </div>
        <div className="features-grid">
          {[
            { icon: "📱", title: "QR Code Ordering", desc: "Customers scan, browse and order directly from their phones. No app download required. Works on any device." },
            { icon: "👨‍🍳", title: "Kitchen Display System", desc: "Real-time order management for your kitchen staff. Track New, Preparing, Ready and Delivered orders live." },
            { icon: "📊", title: "Smart Analytics", desc: "Filter orders by date, view table-wise history, track revenue and monitor peak hours with detailed reports." },
            { icon: "🧾", title: "GST Receipts", desc: "Auto-generate professional receipts with CGST and SGST breakdown. Print or share digitally with one click." },
            { icon: "🏪", title: "Multi-Restaurant", desc: "Manage multiple restaurant branches from a single super admin panel. Each restaurant gets isolated data." },
            { icon: "🔐", title: "Secure & Reliable", desc: "JWT authentication, rate limiting, input sanitization and MongoDB cloud storage keep your data safe 24/7." },
          ].map((f, i) => (
            <div key={i} className="feature-card fade-up">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how" suppressHydrationWarning>
        <div className="how-inner">
          <div className="fade-up" style={{textAlign:"center"}}>
            <span className="section-tag">{"✦ How It Works"}</span>
            <h2 className="section-title">{"Up and running in minutes"}</h2>
            <p className="section-desc" style={{margin:"0 auto"}}>{"Getting started with Platfo is simple. No technical expertise required."}</p>
          </div>
          <div className="steps-grid">
            {[
              { num: "01", title: "Sign Up", desc: "Create your restaurant account with email verification in under 2 minutes." },
              { num: "02", title: "Setup Menu", desc: "Add your menu items with emojis, descriptions, prices and categories." },
              { num: "03", title: "Print QR Codes", desc: "Generate unique QR codes for each table and place them on your tables." },
              { num: "04", title: "Start Receiving Orders", desc: "Customers scan, order and you manage everything from your dashboard!" },
            ].map((s, i) => (
              <div key={i} className="step-card fade-up">
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" suppressHydrationWarning>
        <div className="fade-up" style={{textAlign:"center"}}>
          <span className="section-tag">{"✦ Pricing"}</span>
          <h2 className="section-title">{"Simple, transparent pricing"}</h2>
          <p className="section-desc" style={{margin:"0 auto"}}>{"Start free, scale as you grow. No hidden fees ever."}</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card fade-up">
            <div className="pricing-plan">{"Starter"}</div>
            <div className="pricing-price">{"₹999"}<span>{"/mo"}</span></div>
            <div className="pricing-desc">{"Perfect for small restaurants just getting started with digital ordering."}</div>
            <ul className="pricing-features">
              {["1 Restaurant","Up to 5 Tables","20 Menu Items","QR Code Ordering","Basic Dashboard","Email Support"].map((f,i) => <li key={i}>{f}</li>)}
            </ul>
            <a href="/signup" className="pricing-btn pricing-btn-secondary">{"Get Started"}</a>
          </div>
          <div className="pricing-card popular fade-up">
            <div className="popular-badge">{"Most Popular"}</div>
            <div className="pricing-plan">{"Growth"}</div>
            <div className="pricing-price">{"₹2,499"}<span>{"/mo"}</span></div>
            <div className="pricing-desc">{"For growing restaurants that need more power and features."}</div>
            <ul className="pricing-features">
              {["1 Restaurant","Up to 20 Tables","Unlimited Menu Items","Kitchen Display Screen","Table-wise History","GST Receipt Printing","Priority Support"].map((f,i) => <li key={i}>{f}</li>)}
            </ul>
            <a href="/signup" className="pricing-btn pricing-btn-primary">{"Get Started"}</a>
          </div>
          <div className="pricing-card fade-up">
            <div className="pricing-plan">{"Pro"}</div>
            <div className="pricing-price">{"₹4,999"}<span>{"/mo"}</span></div>
            <div className="pricing-desc">{"For restaurant chains and businesses with multiple locations."}</div>
            <ul className="pricing-features">
              {["Up to 5 Restaurants","Unlimited Tables","Unlimited Menu Items","All Growth Features","Advanced Analytics","Custom Branding","Dedicated Support"].map((f,i) => <li key={i}>{f}</li>)}
            </ul>
            <a href="/signup" className="pricing-btn pricing-btn-secondary">{"Get Started"}</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials" suppressHydrationWarning>
        <div className="testimonials-inner">
          <div className="fade-up" style={{textAlign:"center"}}>
            <span className="section-tag">{"✦ Reviews"}</span>
            <h2 className="section-title">{"Loved by restaurants across India"}</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { emoji: "👨‍🍳", text: '"Platfo transformed how we take orders. Our table turnover increased by 40% and customers love the seamless experience!"', name: "Rajesh Kumar", role: "Owner, Spice Garden Mumbai" },
              { emoji: "👩‍🍳", text: '"The kitchen display system is a game changer. No more shouting orders across the kitchen. Everything is organized and efficient."', name: "Priya Sharma", role: "Head Chef, The Hill Bistro" },
              { emoji: "🧑‍💼", text: '"Setting up was incredibly easy. Within an hour we had QR codes on every table and orders flowing in. Highly recommend!"', name: "Amit Patel", role: "Manager, Pizza Palace Delhi" },
            ].map((t, i) => (
              <div key={i} className="testimonial-card fade-up">
                <div className="testimonial-stars">{"★★★★★"}</div>
                <div className="testimonial-text">{t.text}</div>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.emoji}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" suppressHydrationWarning>
        <div className="cta-inner fade-up">
          <h2 className="cta-title">{"Ready to transform your restaurant?"}</h2>
          <p className="cta-desc">{"Join hundreds of restaurants already using Platfo. Start your 14-day free trial today — no credit card required."}</p>
          <div className="hero-buttons">
            <a href="/signup" className="btn-primary">{"Start Free Trial →"}</a>
            <a href="#" className="btn-secondary">{"Book a Demo"}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer suppressHydrationWarning>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">{"Plat"}<span style={{color:"#FF3008"}}>{"fo"}</span></div>
            <p>{"The smart restaurant platform that helps you manage orders, delight customers and grow your business."}</p>
          </div>
          <div className="footer-col">
            <h4>{"Product"}</h4>
            <ul>{["Features","Pricing","Changelog","Roadmap"].map((l,i) => <li key={i}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>{"Company"}</h4>
            <ul>{["About","Blog","Careers","Contact"].map((l,i) => <li key={i}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>{"Legal"}</h4>
            <ul>{["Privacy Policy","Terms of Service","Refund Policy","Cookie Policy"].map((l,i) => <li key={i}><a href="#">{l}</a></li>)}</ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{"© 2026 Platfo. All rights reserved."}</p>
          <p>{"Made with ❤️ in India"}</p>
        </div>
      </footer>
    </div>
  );
}
