import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

function generateToken(tableNumber) {
  return String(tableNumber) + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

export default function MenuPage() {
  const router = useRouter();
  const { table, restaurantId } = router.query;
  const tableNumber = table ? Number(table) : null;

  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerError, setCustomerError] = useState("");
  const isSubmitting = useRef(false);
  const clientToken = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;
    clientToken.current = generateToken(tableNumber || 0);
    fetch("/api/restaurant?id=" + restaurantId)
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurantData(data.restaurant);
          setMenuItems(data.restaurant.menu || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId, tableNumber]);

  const addToCart = (item) => {
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) next[itemId]--;
      else delete next[itemId];
      return next;
    });
  };

  const cartItems = menuItems.filter((i) => cart[i.id]).map((i) => ({ ...i, qty: cart[i.id] }));
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleProceedToOrder = () => {
    if (cartItems.length === 0) { setError("Your cart is empty."); return; }
    if (!tableNumber) { setError("No table number. Please scan QR code again."); return; }
    setError("");
    setShowCart(false);
    setCustomerError("");
    setShowCustomerForm(true);
  };

  const placeOrder = async () => {
    if (!customerName.trim()) { setCustomerError("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setCustomerError("Please enter a valid 10 digit phone number.");
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setPlacing(true);
    setCustomerError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId, tableNumber, items: cartItems,
          subtotal, gst, total,
          clientToken: clientToken.current,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.status === 409) { setCustomerError("Order already placed!"); isSubmitting.current = false; setPlacing(false); return; }
      if (!res.ok) throw new Error(data.error || "Failed.");
      setOrderData(data.order);
      setPlaced(true);
      setCart({});
      setShowCustomerForm(false);
    } catch (err) {
      setCustomerError(err.message || "Something went wrong.");
      isSubmitting.current = false;
    } finally {
      setPlacing(false);
    }
  };

  const orderAgain = () => {
    setPlaced(false);
    setError("");
    setCustomerName("");
    setCustomerPhone("");
    setOrderData(null);
    isSubmitting.current = false;
    clientToken.current = generateToken(tableNumber || 0);
  };

  const printReceipt = () => {
    if (orderData) {
      window.open("/receipt/" + orderData.id + "?restaurantId=" + restaurantId, "_blank");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#FFF5F2" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"🍽️"}</div>
          <p style={{ color: "#888", fontWeight: 600 }}>{"Loading menu..."}</p>
        </div>
      </div>
    );
  }

  if (!restaurantData && !loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#FFF5F2" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"❌"}</div>
          <h2 style={{ color: "#111", marginBottom: "8px" }}>{"Restaurant not found"}</h2>
          <p style={{ color: "#888" }}>{"Please scan the correct QR code."}</p>
        </div>
      </div>
    );
  }

  if (placed && orderData) {
    return (
      <>
        <Head><title>{"Order Placed!"}</title></Head>
        <div style={{ minHeight: "100vh", background: "#FF3008", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: "32px", padding: "40px 28px", textAlign: "center", maxWidth: "380px", width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "80px", height: "80px", background: "#FF3008", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", color: "#fff", margin: "0 auto 20px", fontWeight: 900 }}>{"✓"}</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", marginBottom: "6px" }}>{"Order Placed!"}</h2>
            <p style={{ color: "#888", marginBottom: "20px", fontSize: "0.9rem" }}>{"Your food is being prepared"}</p>
            <div style={{ background: "#FFF3F0", border: "2px solid #FFE0D6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px" }}>
              <div style={{ fontSize: "0.75rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>{"Order ID"}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111" }}>{orderData.id}</div>
            </div>
            <div style={{ background: "#F9F9F9", borderRadius: "12px", padding: "14px 16px", marginBottom: "14px", textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>{"Customer Details"}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#555", fontSize: "0.85rem" }}>{"Name:"}</span>
                <span style={{ fontWeight: 700, color: "#111", fontSize: "0.85rem" }}>{orderData.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#555", fontSize: "0.85rem" }}>{"Phone:"}</span>
                <span style={{ fontWeight: 700, color: "#111", fontSize: "0.85rem" }}>{orderData.customerPhone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#555", fontSize: "0.85rem" }}>{"Table:"}</span>
                <span style={{ fontWeight: 700, color: "#111", fontSize: "0.85rem" }}>{"Table " + orderData.tableNumber}</span>
              </div>
            </div>
            <div style={{ background: "#F9F9F9", borderRadius: "12px", padding: "14px 16px", marginBottom: "14px", textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>{"Items Ordered"}</div>
              {orderData.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                  <span style={{ color: "#444" }}>{item.emoji + " " + item.name + " x" + item.qty}</span>
                  <span style={{ fontWeight: 700, color: "#111" }}>{"Rs. " + item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed #E0E0E0", marginTop: "8px", paddingTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "#888" }}>{"Subtotal"}</span>
                  <span style={{ color: "#555" }}>{"Rs. " + orderData.subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                  <span style={{ color: "#888" }}>{"GST (18%)"}</span>
                  <span style={{ color: "#555" }}>{"Rs. " + orderData.gst}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem" }}>
                  <span style={{ color: "#111" }}>{"Total"}</span>
                  <span style={{ color: "#FF3008" }}>{"Rs. " + orderData.total}</span>
                </div>
              </div>
            </div>
            <button onClick={printReceipt} style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "0.95rem", marginBottom: "10px", cursor: "pointer", fontFamily: "sans-serif" }}>
              {"Print Receipt"}
            </button>
            <button onClick={orderAgain} style={{ width: "100%", background: "#FF3008", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", boxShadow: "0 6px 20px rgba(255,48,8,0.4)" }}>
              {"Order More Items"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>{restaurantData ? restaurantData.name + " Menu" : "Menu"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#FFF5F2", paddingBottom: "120px", fontFamily: "sans-serif" }}>
        <div style={{ background: "#111", color: "#fff", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ maxWidth: "520px", margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{restaurantData ? restaurantData.name : "Menu"}</div>
              <div style={{ fontSize: "0.75rem", color: "#FF3008", fontWeight: 600, marginTop: "1px" }}>{"Hot and Fresh"}</div>
            </div>
            {tableNumber ? (
              <div style={{ background: "#FF3008", padding: "8px 18px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700 }}>{"Table " + tableNumber}</div>
            ) : (
              <div style={{ background: "#333", padding: "8px 18px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 }}>{"No Table"}</div>
            )}
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #FF3008 0%, #FF6B35 100%)", padding: "32px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-50px", left: "20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <div style={{ maxWidth: "520px", margin: "0 auto", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>{"Welcome to"}</p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "10px" }}>{"Our Menu"}</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem" }}>{"Fresh ingredients. Bold flavours. Fast service."}</p>
          </div>
        </div>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 16px" }}>
          {!tableNumber && (
            <div style={{ background: "#FFF3CD", border: "2px solid #FFC107", borderRadius: "14px", padding: "14px 16px", marginBottom: "20px", fontSize: "0.9rem", color: "#856404" }}>
              {"No table found. Please scan the QR code at your table."}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "4px", height: "24px", background: "#FF3008", borderRadius: "4px" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111" }}>{"All Items"}</h2>
          </div>
          {menuItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#AAA" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{"🍽️"}</div>
              <p style={{ fontWeight: 600 }}>{"No items on menu yet."}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {menuItems.map((item) => (
                <div key={item.id} style={{ background: "#fff", borderRadius: "20px", padding: "18px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "2px solid #f0f0f0" }}>
                  <div style={{ width: "70px", height: "70px", background: "#FFF5F2", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.tag !== "" && (
                      <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase", display: "inline-block", marginBottom: "4px" }}>{item.tag}</span>
                    )}
                    <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111", marginBottom: "3px" }}>{item.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "6px", lineHeight: 1.4 }}>{item.desc}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FF3008" }}>{"Rs. " + item.price}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {cart[item.id] ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFF5F2", borderRadius: "12px", padding: "6px 10px" }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: "#FF3008", color: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "10px", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}>{"-"}</button>
                        <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111", minWidth: "20px", textAlign: "center" }}>{cart[item.id]}</span>
                        <button onClick={() => addToCart(item)} style={{ background: "#FF3008", color: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "10px", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}>{"+"}</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "11px 24px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,48,8,0.35)" }}>{"Add"}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.78rem", marginTop: "20px", fontStyle: "italic" }}>{"All prices are exclusive of 18% GST"}</p>
        </div>
        {itemCount > 0 && (
          <button onClick={() => { setShowCart(true); setError(""); }} style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#FF3008", color: "#fff", border: "none", borderRadius: "20px", padding: "16px 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px rgba(255,48,8,0.5)", display: "flex", alignItems: "center", gap: "10px", zIndex: 100, whiteSpace: "nowrap" }}>
            <span>{"View Cart"}</span>
            <span style={{ background: "#fff", color: "#FF3008", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 900 }}>{itemCount}</span>
            <span>{"Rs. " + total}</span>
          </button>
        )}
        {showCart && (
          <>
            <div onClick={() => setShowCart(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} />
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderRadius: "28px 28px 0 0", padding: "28px 20px 40px", boxShadow: "0 -10px 50px rgba(0,0,0,0.15)", zIndex: 200, maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111" }}>{"Your Cart"}</h3>
                <button onClick={() => setShowCart(false)} style={{ background: "#F5F5F5", border: "none", width: "36px", height: "36px", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}>{"X"}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", background: "#FFF5F2", borderRadius: "14px", border: "1.5px solid #FFE0D6" }}>
                    <span style={{ fontSize: "1.8rem" }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>{item.name}</div>
                      <div style={{ color: "#FF3008", fontWeight: 700, fontSize: "0.85rem" }}>{"Rs. " + item.price + " each"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", borderRadius: "10px", padding: "5px 8px" }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "#FF3008", color: "#fff", border: "none", width: "28px", height: "28px", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>{"-"}</button>
                      <span style={{ fontWeight: 800, minWidth: "18px", textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => addToCart(item)} style={{ background: "#FF3008", color: "#fff", border: "none", width: "28px", height: "28px", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>{"+"}</button>
                    </div>
                    <div style={{ fontWeight: 800, color: "#111", minWidth: "65px", textAlign: "right" }}>{"Rs. " + item.price * item.qty}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#111", borderRadius: "16px", padding: "16px 20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{"Subtotal"}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{"Rs. " + subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #333", marginBottom: "12px" }}>
                  <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{"GST (18%)"}</span>
                  <span style={{ color: "#FF6B35", fontWeight: 600 }}>{"+ Rs. " + gst}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{"Total Amount"}</span>
                  <span style={{ color: "#FF3008", fontWeight: 800, fontSize: "1.5rem" }}>{"Rs. " + total}</span>
                </div>
              </div>
              {error && (
                <div style={{ background: "#FFF0F0", border: "1.5px solid #FFB3B3", borderRadius: "12px", padding: "12px", color: "#D00000", fontSize: "0.9rem", marginBottom: "14px", textAlign: "center" }}>{error}</div>
              )}
              <button onClick={handleProceedToOrder} style={{ width: "100%", background: "#FF3008", color: "#fff", border: "none", padding: "18px", borderRadius: "14px", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,48,8,0.4)", fontFamily: "sans-serif" }}>{"Proceed to Order"}</button>
            </div>
          </>
        )}
        {showCustomerForm && (
          <>
            <div onClick={() => setShowCustomerForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} />
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderRadius: "28px 28px 0 0", padding: "28px 20px 40px", boxShadow: "0 -10px 50px rgba(0,0,0,0.15)", zIndex: 200, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111" }}>{"Your Details"}</h3>
                <button onClick={() => setShowCustomerForm(false)} style={{ background: "#F5F5F5", border: "none", width: "36px", height: "36px", borderRadius: "10px", fontSize: "1rem", cursor: "pointer", fontWeight: 700 }}>{"X"}</button>
              </div>
              <p style={{ color: "#888", fontSize: "0.88rem", marginBottom: "18px" }}>{"Please fill in your details to confirm the order."}</p>
              <div style={{ background: "#FFF5F2", borderRadius: "14px", padding: "14px 16px", marginBottom: "18px", border: "1.5px solid #FFE0D6" }}>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: "10px", fontSize: "0.88rem", textTransform: "uppercase" }}>{"Order Summary"}</div>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#555", marginBottom: "6px" }}>
                    <span>{item.emoji + " " + item.name + " x" + item.qty}</span>
                    <span style={{ fontWeight: 700 }}>{"Rs. " + item.price * item.qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed #FFE0D6", marginTop: "10px", paddingTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#888", marginBottom: "4px" }}>
                    <span>{"Subtotal"}</span><span>{"Rs. " + subtotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#888", marginBottom: "6px" }}>
                    <span>{"GST (18%)"}</span><span>{"Rs. " + gst}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem" }}>
                    <span style={{ color: "#111" }}>{"Total"}</span>
                    <span style={{ color: "#FF3008" }}>{"Rs. " + total}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333", display: "block", marginBottom: "8px" }}>{"Your Name"}</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333", display: "block", marginBottom: "8px" }}>{"Phone Number"}</label>
                <input
                  type="tel"
                  placeholder="Enter 10 digit mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #EEE", fontSize: "1rem", outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" }}
                />
              </div>
              {customerError && (
                <div style={{ background: "#FFF0F0", border: "1.5px solid #FFB3B3", borderRadius: "12px", padding: "12px 16px", color: "#D00000", fontSize: "0.9rem", marginBottom: "14px", textAlign: "center" }}>{customerError}</div>
              )}
              <button
                onClick={placeOrder}
                disabled={placing}
                style={{ width: "100%", background: placing ? "#999" : "#FF3008", color: "#fff", border: "none", padding: "18px", borderRadius: "14px", fontSize: "1.1rem", fontWeight: 700, cursor: placing ? "not-allowed" : "pointer", boxShadow: placing ? "none" : "0 8px 24px rgba(255,48,8,0.4)", fontFamily: "sans-serif" }}>
                {placing ? "Placing Order..." : "Confirm Order — Rs. " + total}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
