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

  const handleOrder = async () => {
    if (!customerName.trim()) { setError("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.length < 10) { setError("Please enter a valid phone number."); return; }
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
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to place order."); return; }
      setOrdered(true);
    } catch { setError("Something went wrong."); }
    finally { setOrdering(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{"🍽️"}</div>
        <p>{"Loading menu..."}</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", fontFamily: "sans-serif" }}>
      <p>{"Restaurant not found."}</p>
    </div>
  );

  if (ordered) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{"✅"}</div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px" }}>{"Order Placed!"}</h2>
        <p style={{ color: "#888", marginBottom: "8px" }}>{"Thank you, " + customerName + "!"}</p>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>{"Your order for Table " + table + " has been sent to the kitchen."}</p>
        <div style={{ background: "#1A1A1A", borderRadius: "16px", padding: "20px", marginTop: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
              <span>{item.name + " x" + item.qty}</span>
              <span style={{ color: "#FF3008", fontWeight: 700 }}>{"Rs. " + item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", marginTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
            <span>{"Total"}</span>
            <span style={{ color: "#FF3008" }}>{"Rs. " + total}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const sections = restaurant.sections || [];
  const menu = restaurant.menu || [];
  const getItemsForSection = (sectionId) => menu.filter((item) => item.sectionId === Number(sectionId));
  const unsectionedItems = menu.filter((item) => !item.sectionId);
  const allItems = activeSection === "all" ? menu : activeSection === "other" ? unsectionedItems : getItemsForSection(activeSection);

  const ItemCard = ({ item }) => {
    const qty = getQty(item.id);
    return (
      <div style={{ background: "#1A1A1A", borderRadius: "16px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: qty > 0 ? "1.5px solid #FF3008" : "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{item.name}</div>
          {item.desc && <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "3px" }}>{item.desc}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontWeight: 800, color: "#FF3008", fontSize: "1rem" }}>{"Rs. " + item.price}</span>
            {item.tag && <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>{item.tag}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
          {qty === 0 ? (
            <button onClick={() => addToCart(item)} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", fontFamily: "sans-serif" }}>{"Add"}</button>
          ) : (
            <>
              <button onClick={() => removeFromCart(item.id)} style={{ width: "34px", height: "34px", background: "#222", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{"−"}</button>
              <span style={{ fontWeight: 800, minWidth: "20px", textAlign: "center", color: "#fff" }}>{qty}</span>
              <button onClick={() => addToCart(item)} style={{ width: "34px", height: "34px", background: "#FF3008", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>{"+"}</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head><title>{restaurant.name + " — Menu"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#111", fontFamily: "sans-serif", color: "#fff", paddingBottom: cart.length > 0 ? "140px" : "40px" }}>

        {/* Header */}
        <div style={{ background: "#1A1A1A", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{restaurant.name}</h1>
            <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "4px" }}>{"Table " + table + " · Scan & Order"}</p>
          </div>
        </div>

        {/* Section Tabs */}
        {sections.length > 0 && (
          <div style={{ background: "#1A1A1A", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto", whiteSpace: "nowrap" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", gap: "4px", padding: "10px 16px" }}>
              {sections.map((section) => (
                <button key={section.id} onClick={() => setActiveSection(section.id)}
                  style={{ padding: "8px 18px", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", background: activeSection === section.id ? "#FF3008" : "rgba(255,255,255,0.08)", color: activeSection === section.id ? "#fff" : "#aaa", transition: "all 0.2s" }}>
                  {section.name}
                </button>
              ))}
              {unsectionedItems.length > 0 && (
                <button onClick={() => setActiveSection("other")}
                  style={{ padding: "8px 18px", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", background: activeSection === "other" ? "#FF3008" : "rgba(255,255,255,0.08)", color: activeSection === "other" ? "#fff" : "#aaa" }}>
                  {"Other"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px" }}>

          {/* Empty state */}
          {menu.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"🍽️"}</div>
              <p style={{ fontWeight: 600 }}>{"Menu coming soon!"}</p>
            </div>
          )}

          {/* No sections — show all items */}
          {sections.length === 0 && menu.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {menu.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}

          {/* With sections — show active section items */}
          {sections.length > 0 && (
            <div>
              {allItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{"🍽️"}</div>
                  <p>{"No items in this section yet."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {allItems.map((item) => <ItemCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && !showCustomerForm && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1A1A", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "16px 20px", zIndex: 20 }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>{cart.reduce((s, i) => s + i.qty, 0) + " items · Rs. " + subtotal + " + GST"}</span>
                <span style={{ fontWeight: 800, color: "#FF3008", fontSize: "1.1rem" }}>{"Total: Rs. " + total}</span>
              </div>
              <button onClick={() => setShowCustomerForm(true)} style={{ width: "100%", background: "#FF3008", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(255,48,8,0.4)" }}>
                {"Proceed to Order →"}
              </button>
            </div>
          </div>
        )}

        {/* Customer Form */}
        {showCustomerForm && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1A1A", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "20px", zIndex: 20, borderRadius: "20px 20px 0 0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <h3 style={{ fontWeight: 800, marginBottom: "16px", fontSize: "1.1rem" }}>{"Your Details"}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <input
                  placeholder="Your Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "#222", color: "#fff", fontSize: "1rem", outline: "none", fontFamily: "sans-serif" }}
                />
                <input
                  placeholder="Phone Number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  type="tel"
                  maxLength={10}
                  style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "#222", color: "#fff", fontSize: "1rem", outline: "none", fontFamily: "sans-serif" }}
                />
              </div>
              {error && <div style={{ color: "#FF6B6B", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "0.85rem", color: "#aaa" }}>
                <span>{"Total: "}<strong style={{ color: "#FF3008" }}>{"Rs. " + total}</strong></span>
                <span>{cart.reduce((s, i) => s + i.qty, 0) + " items"}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowCustomerForm(false)} style={{ flex: 1, background: "#222", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>{"Back"}</button>
                <button onClick={handleOrder} disabled={ordering} style={{ flex: 2, background: ordering ? "#666" : "#FF3008", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: ordering ? "not-allowed" : "pointer", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(255,48,8,0.3)" }}>
                  {ordering ? "Placing Order..." : "Place Order →"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

