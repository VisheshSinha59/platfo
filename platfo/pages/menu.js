import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Menu() {
  const router = useRouter();
  const { restaurantId, table } = router.query;
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordered, setOrdered] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    fetch("/api/restaurant?id=" + restaurantId)
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          const sections = data.restaurant.sections || [];
          if (sections.length > 0) setActiveSection(sections[0].id);
          else setActiveSection("all");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((i) => i.id !== itemId);
      return prev.map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const getQty = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    return item ? item.qty : 0;
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleOrder = async (paymentMethod = "cash", paymentId = null) => {
    if (!customerName.trim()) { setError("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.length < 10) { setError("Please enter a valid 10-digit phone number."); return; }
    setOrdering(true); setError("");
    try {
      const clientToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId, tableNumber: Number(table),
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          clientToken, customerName: customerName.trim(), customerPhone: customerPhone.trim(),
          paymentMethod, paymentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to place order."); return; }
      setOrdered(true);
    } catch { setError("Something went wrong."); }
    finally { setOrdering(false); }
  };

  const handleRazorpayPayment = async () => {
    if (!customerName.trim()) { setError("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.length < 10) { setError("Please enter a valid phone number."); return; }
    setError("");
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, amount: total }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Payment setup failed."); return; }

      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: "INR",
        name: restaurant.name,
        description: "Table " + table + " Order",
        order_id: data.order.id,
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: "#FF3008" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await handleOrder("online", response.razorpay_payment_id);
          } else {
            setError("Payment verification failed. Please try again.");
          }
        },
        modal: { ondismiss: () => { setError("Payment cancelled."); setOrdering(false); } }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError("Payment failed: " + err.message);
      setOrdering(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,48,8,0.2)", borderTop: "3px solid #FF3008", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#555", fontSize: "0.9rem" }}>{"Loading menu..."}</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"😕"}</div>
        <p style={{ color: "#555" }}>{"Restaurant not found."}</p>
      </div>
    </div>
  );

  if (ordered) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#fff", fontFamily: "sans-serif", padding: "20px" }}>
      <style>{`@keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      <div style={{ textAlign: "center", maxWidth: "420px", width: "100%", animation: "pop 0.4s ease" }}>
        <div style={{ width: "90px", height: "90px", background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 24px", border: "2px solid rgba(74,222,128,0.3)" }}>{"✅"}</div>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>{"Order Placed!"}</h2>
        <p style={{ color: "#555", marginBottom: "4px" }}>{"Thank you, " + customerName + "!"}</p>
        <p style={{ color: "#444", fontSize: "0.85rem", marginBottom: "28px" }}>{"Table " + table + " · Your kitchen is preparing your order"}</p>
        <div style={{ background: "#161616", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}>
          <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px", fontWeight: 600 }}>{"Order Summary"}</div>
          {cart.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem" }}>
              <span style={{ color: "#888" }}>{item.name}<span style={{ color: "#555", fontSize: "0.8rem" }}>{" × " + item.qty}</span></span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{"₹" + item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#555", marginBottom: "6px" }}>
              <span>{"GST (18%)"}</span><span>{"₹" + gst}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
              <span>{"Total"}</span>
              <span style={{ color: "#FF3008" }}>{"₹" + total}</span>
            </div>
          </div>
        </div>
        <p style={{ color: "#333", fontSize: "0.78rem" }}>{"Your waiter will bring your food shortly. Enjoy your meal! 🍽️"}</p>
      </div>
    </div>
  );

  const sections = restaurant.sections || [];
  const menuItems = restaurant.menu || [];
  const getItemsForSection = (sectionId) => menuItems.filter((item) => item.sectionId === Number(sectionId));
  const unsectionedItems = menuItems.filter((item) => !item.sectionId);
  const allItems = activeSection === "all" ? menuItems : activeSection === "other" ? unsectionedItems : getItemsForSection(activeSection);

  const ItemCard = ({ item }) => {
    const qty = getQty(item.id);
    return (
      <div style={{ background: "#161616", borderRadius: "14px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: qty > 0 ? "1px solid rgba(255,48,8,0.4)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
        {qty > 0 && <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "#FF3008" }} />}
        <div style={{ flex: 1, paddingLeft: qty > 0 ? "8px" : "0" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{item.name}</div>
          {item.desc && <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "3px", lineHeight: 1.4 }}>{item.desc}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <span style={{ fontWeight: 800, color: "#FF3008", fontSize: "1rem" }}>{"₹" + item.price}</span>
            {item.tag && <span style={{ background: "rgba(255,48,8,0.1)", color: "#FF3008", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(255,48,8,0.2)" }}>{item.tag}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "14px" }}>
          {qty === 0 ? (
            <button onClick={() => addToCart(item)} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "9px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", fontFamily: "sans-serif", boxShadow: "0 4px 14px rgba(255,48,8,0.3)" }}>{"Add"}</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => removeFromCart(item.id)} style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: "7px", fontSize: "1.1rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{"−"}</button>
              <span style={{ fontWeight: 800, minWidth: "16px", textAlign: "center", color: "#FF3008", fontSize: "1rem" }}>{qty}</span>
              <button onClick={() => addToCart(item)} style={{ width: "28px", height: "28px", background: "#FF3008", color: "#fff", border: "none", borderRadius: "7px", fontSize: "1.1rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{"+"}</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head><title>{restaurant.name + " — Menu"}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0A; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 0; height: 0; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { outline: none; border-color: rgba(255,48,8,0.5) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "sans-serif", color: "#fff", paddingBottom: "100px" }}>

        {/* Header */}
        <div style={{ background: "rgba(10,10,10,0.95)", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.5px" }}>{restaurant.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <div style={{ width: "6px", height: "6px", background: "#4ADE80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#555", fontSize: "0.75rem" }}>{"Table " + table + " · Open for orders"}</span>
              </div>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setShowCart(true)} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(255,48,8,0.3)" }}>
                {"🛒 " + totalItems}
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "6px" }}>{"₹" + total}</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        {sections.length > 0 && (
          <div style={{ position: "sticky", top: "65px", zIndex: 10, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", overflowX: "auto", whiteSpace: "nowrap", padding: "12px 20px", display: "flex", gap: "6px" }}>
              {sections.map((section) => (
                <button key={section.id} onClick={() => setActiveSection(section.id)}
                  style={{ padding: "8px 16px", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600, fontSize: "0.82rem", whiteSpace: "nowrap", background: activeSection === section.id ? "#FF3008" : "rgba(255,255,255,0.06)", color: activeSection === section.id ? "#fff" : "#555", transition: "all 0.2s", boxShadow: activeSection === section.id ? "0 4px 14px rgba(255,48,8,0.3)" : "none" }}>
                  {section.name}
                  <span style={{ marginLeft: "6px", fontSize: "0.68rem", opacity: 0.7 }}>{"(" + getItemsForSection(section.id).length + ")"}</span>
                </button>
              ))}
              {unsectionedItems.length > 0 && (
                <button onClick={() => setActiveSection("other")}
                  style={{ padding: "8px 16px", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600, fontSize: "0.82rem", whiteSpace: "nowrap", background: activeSection === "other" ? "#FF3008" : "rgba(255,255,255,0.06)", color: activeSection === "other" ? "#fff" : "#555", transition: "all 0.2s" }}>
                  {"Other"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px" }}>
          {menuItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>{"🍽️"}</div>
              <p style={{ color: "#444", fontWeight: 600 }}>{"Menu coming soon!"}</p>
            </div>
          )}
          {sections.length === 0 && menuItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeIn 0.3s ease" }}>
              {menuItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
          {sections.length > 0 && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {allItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#444" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.3 }}>{"🍽️"}</div>
                  <p>{"No items in this section yet."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {allItems.map((item) => <ItemCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Drawer */}
        {showCart && (
          <>
            <div onClick={() => setShowCart(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 30, backdropFilter: "blur(4px)" }} />
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#161616", borderRadius: "24px 24px 0 0", padding: "24px 20px", zIndex: 40, maxHeight: "80vh", overflow: "auto", animation: "slideUp 0.3s ease", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>{"Your Order"}</h3>
                  <button onClick={() => setShowCart(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#888", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}>{"×"}</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</div>
                        <div style={{ color: "#FF3008", fontWeight: 700, fontSize: "0.85rem", marginTop: "2px" }}>{"₹" + item.price}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: "7px", fontSize: "1rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{"−"}</button>
                        <span style={{ fontWeight: 800, minWidth: "20px", textAlign: "center", color: "#FF3008" }}>{item.qty}</span>
                        <button onClick={() => addToCart(item)} style={{ width: "28px", height: "28px", background: "#FF3008", color: "#fff", border: "none", borderRadius: "7px", fontSize: "1rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{"+"}</button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "60px", textAlign: "right" }}>{"₹" + item.price * item.qty}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555", marginBottom: "8px" }}>
                    <span>{"Subtotal"}</span><span style={{ color: "#fff" }}>{"₹" + subtotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span>{"GST (18%)"}</span><span style={{ color: "#fff" }}>{"₹" + gst}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
                    <span>{"Total"}</span><span style={{ color: "#FF3008" }}>{"₹" + total}</span>
                  </div>
                </div>

                {!showCustomerForm ? (
                  <button onClick={() => setShowCustomerForm(true)} style={{ width: "100%", background: "#FF3008", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(255,48,8,0.4)" }}>
                    {"Proceed to Order →"}
                  </button>
                ) : (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                      <input placeholder="Your Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "0.95rem", outline: "none", fontFamily: "sans-serif" }} />
                      <input placeholder="Phone Number * (10 digits)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} type="tel" maxLength={10} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "0.95rem", outline: "none", fontFamily: "sans-serif" }} />
                    </div>
                    {error && <div style={{ color: "#FF6B6B", fontSize: "0.82rem", marginBottom: "10px" }}>{"⚠️ " + error}</div>}
                    <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", fontWeight: 600 }}>{"Choose Payment"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                      {restaurant.razorpayKeyId && (
                        <button onClick={handleRazorpayPayment} disabled={ordering} style={{ width: "100%", background: "rgba(129,140,248,0.15)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.3)", padding: "16px", borderRadius: "12px", fontWeight: 700, cursor: ordering ? "not-allowed" : "pointer", fontFamily: "sans-serif", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          {"💳 Pay Online · ₹" + total}
                          <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{"(UPI, Card, Netbanking)"}</span>
                        </button>
                      )}
                      <button onClick={() => handleOrder("cash")} disabled={ordering} style={{ width: "100%", background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)", padding: "16px", borderRadius: "12px", fontWeight: 700, cursor: ordering ? "not-allowed" : "pointer", fontFamily: "sans-serif", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {"💵 Pay by Cash · ₹" + total}
                      </button>
                    </div>
                    <button onClick={() => setShowCustomerForm(false)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", color: "#666", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.88rem" }}>{"← Back"}</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Sticky Cart Button */}
        {cart.length > 0 && !showCart && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", zIndex: 20 }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <button onClick={() => setShowCart(true)} style={{ width: "100%", background: "#FF3008", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(255,48,8,0.4)" }}>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.85rem" }}>{totalItems + " items"}</span>
                <span>{"View Cart →"}</span>
                <span style={{ fontWeight: 800 }}>{"₹" + total}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
