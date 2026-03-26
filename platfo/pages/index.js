import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const menuItems = [
  { id: 1, name: "Burger", price: 120, emoji: "🍔" },
  { id: 2, name: "Pizza", price: 250, emoji: "🍕" },
  { id: 3, name: "Fries", price: 90, emoji: "🍟" },
  { id: 4, name: "Coke", price: 60, emoji: "🥤" },
];

function generateToken(tableNumber) {
  return `${tableNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MenuPage() {
  const router = useRouter();
  const { table } = router.query;
  const tableNumber = table ? Number(table) : null;

  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");
  const isSubmitting = useRef(false);
  const clientToken = useRef(tableNumber ? generateToken(tableNumber) : null);

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

  const cartItems = menuItems
    .filter((i) => cart[i.id])
    .map((i) => ({ ...i, qty: cart[i.id] }));

  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (isSubmitting.current) return;
    if (!tableNumber) { setError("No table number. Please scan the QR code."); return; }
    if (cartItems.length === 0) { setError("Your cart is empty."); return; }

    isSubmitting.current = true;
    setPlacing(true);
    setError("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: cartItems,
          clientToken: clientToken.current,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("Your order was already placed! Please wait.");
        isSubmitting.current = false;
        setPlacing(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setOrderId(data.order.id);
      setPlaced(true);
      setCart({});
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      isSubmitting.current = false;
    } finally {
      setPlacing(false);
    }
  };

  const orderAgain = () => {
    setPlaced(false);
    setError("");
    isSubmitting.current = false;
    clientToken.current = generateToken(tableNumber);
  };

  if (placed) {
    return (
      <>
        <Head><title>{"Order Placed!"}</title></Head>
        <div style={{
          minHeight: "100vh", background: "#FFF8F0", display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px",
          fontFamily: "'Segoe UI', sans-serif"
        }}>
          <div style={{
            background: "#fff", borderRadius: "24px", padding: "48px 32px",
            textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
            maxWidth: "340px", width: "100%"
          }}>
            <div style={{
              width: "72px", height: "72px", background: "#28A745",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "2rem", color: "#fff",
              fontWeight: 900, margin: "0 auto 20px"
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1A1A2E", marginBottom: "8px" }}>
              Order Placed!
            </h2>
            <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "6px" }}>
              {"Order ID: "}<strong style={{ color: "#1A1A2E" }}>{orderId}</strong>
            </p>
            <p style={{ color: "#666", marginBottom: "28px" }}>
              {"Table "}<strong>{tableNumber}</strong>{" — your food is being prepared!"}
            </p>
            <button onClick={orderAgain} style={{
              background: "#E94560", color: "#fff", border: "none",
              padding: "16px 40px", borderRadius: "14px", fontSize: "1rem",
              fontWeight: 700, cursor: "pointer", width: "100%"
            }}>
              Order More
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>{"Menu — Table " + (tableNumber || "")}</title></Head>
      <div style={{
        minHeight: "100vh", background: "#FFF8F0",
        fontFamily: "'Segoe UI', sans-serif", paddingBottom: "40px"
      }}>

        {/* Header */}
        <div style={{
          background: "#1A1A2E", color: "#fff", position: "sticky",
          top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
        }}>
          <div style={{
            maxWidth: "480px", margin: "0 auto", padding: "14px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: "1.3rem", fontWeight: 700 }}>Platfo</span>
            {tableNumber ? (
              <span style={{
                background: "#E94560", padding: "6px 14px",
                borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600
              }}>
                {"Table " + tableNumber}
              </span>
            ) : (
              <span style={{
                background: "#888", padding: "6px 14px",
                borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600
              }}>
                No Table
              </span>
            )}
          </div>
        </div>

        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px" }}>

          {/* No table warning */}
          {!tableNumber && (
            <div style={{
              background: "#FFF3CD", border: "1px solid #FFC107", borderRadius: "12px",
              padding: "14px 16px", marginBottom: "20px", fontSize: "0.9rem", color: "#856404"
            }}>
              No table number found. Please scan the QR code at your table.
            </div>
          )}

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1A1A2E" }}>
            Our Menu
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "4px", marginBottom: "20px" }}>
            Fresh, fast and delicious
          </p>

          {/* Menu Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {menuItems.map((item) => (
              <div key={item.id} style={{
                background: "#fff", borderRadius: "16px", padding: "16px",
                display: "flex", alignItems: "center", gap: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #F0EBE3"
              }}>
                <span style={{ fontSize: "2.4rem", minWidth: "50px", textAlign: "center" }}>
                  {item.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 700, color: "#1A1A2E" }}>
                    {item.name}
                  </span>
                  <span style={{ display: "block", fontSize: "0.95rem", color: "#E94560", fontWeight: 600, marginTop: "3px" }}>
                    {"Rs. " + item.price}
                  </span>
                </div>
                <div>
                  {cart[item.id] ? (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: "#F5F0EB", borderRadius: "12px", padding: "6px 12px"
                    }}>
                      <button onClick={() => removeFromCart(item.id)} style={{
                        background: "#E94560", color: "#fff", border: "none",
                        width: "28px", height: "28px", borderRadius: "8px",
                        fontSize: "1.1rem", fontWeight: 700, cursor: "pointer"
                      }}>
                        -
                      </button>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A2E", minWidth: "16px", textAlign: "center" }}>
                        {cart[item.id]}
                      </span>
                      <button onClick={() => addToCart(item)} style={{
                        background: "#E94560", color: "#fff", border: "none",
                        width: "28px", height: "28px", borderRadius: "8px",
                        fontSize: "1.1rem", fontWeight: 700, cursor: "pointer"
                      }}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={{
                      background: "#E94560", color: "#fff", border: "none",
                      padding: "10px 22px", borderRadius: "12px", fontSize: "1rem",
                      fontWeight: 700, cursor: "pointer"
                    }}>
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart */}
          {cartItems.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: "20px", padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1.5px solid #F0EBE3"
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "16px"
              }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1A1A2E" }}>
                  Your Cart
                </span>
                <span style={{
                  background: "#E94560", color: "#fff", fontSize: "0.75rem",
                  padding: "3px 10px", borderRadius: "20px", fontWeight: 600
                }}>
                  {itemCount + " item" + (itemCount !== 1 ? "s" : "")}
                </span>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "10px",
                  fontSize: "0.95rem", color: "#444"
                }}>
                  <span>{item.emoji + " " + item.name + " x " + item.qty}</span>
                  <span style={{ fontWeight: 700, color: "#1A1A2E" }}>
                    {"Rs. " + item.price * item.qty}
                  </span>
                </div>
              ))}

              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "1.15rem", fontWeight: 800, color: "#1A1A2E",
                borderTop: "2px dashed #EEE", paddingTop: "14px", marginBottom: "18px"
              }}>
                <span>Total</span>
                <span>{"Rs. " + total}</span>
              </div>

              {error && (
                <div style={{
                  background: "#FFF0F0", border: "1px solid #FFB3B3", borderRadius: "10px",
                  padding: "10px 14px", color: "#D00000", fontSize: "0.9rem",
                  marginBottom: "14px", textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={placing || !tableNumber}
                style={{
                  width: "100%",
                  background: placing ? "#999" : !tableNumber ? "#CCC" : "#1A1A2E",
                  color: "#fff", border: "none", padding: "18px", borderRadius: "14px",
                  fontSize: "1.1rem", fontWeight: 800,
                  cursor: placing || !tableNumber ? "not-allowed" : "pointer"
                }}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}

          {cartItems.length === 0 && (
            <p style={{ textAlign: "center", color: "#BBB", fontSize: "0.95rem", marginTop: "10px" }}>
              Add items to get started
            </p>
          )}
        </div>
      </div>
    </>
  );
}
