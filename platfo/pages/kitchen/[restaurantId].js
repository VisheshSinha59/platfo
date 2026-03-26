import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000 / 60);
  if (diff < 1) return "Just now";
  if (diff === 1) return "1 min ago";
  return diff + " mins ago";
}

export default function KitchenDisplay() {
  const router = useRouter();
  const { restaurantId } = router.query;
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [newAlert, setNewAlert] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    fetch("/api/restaurant?id=" + restaurantId)
      .then((r) => r.json())
      .then((data) => setRestaurant(data.restaurant));
  }, [restaurantId]);

  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch("/api/order?restaurantId=" + restaurantId);
      const data = await res.json();
      const active = (data.orders || []).filter((o) => o.status !== "Delivered");
      setOrders((prev) => {
        if (prev.length < active.length) {
          setNewAlert(true);
          setTimeout(() => setNewAlert(false), 3000);
        }
        return active;
      });
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch {}
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const updateStatus = async (orderId, status) => {
    await fetch("/api/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    await fetchOrders();
  };

  const newOrders = orders.filter((o) => o.status === "New");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const readyOrders = orders.filter((o) => o.status === "Ready");

  if (!mounted) return null;

  return (
    <>
      <Head><title>{"Kitchen Display"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "sans-serif", color: "#fff" }}>

        {/* New Order Alert */}
        {newAlert && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
            background: "#FF3008", color: "#fff", textAlign: "center",
            padding: "16px", fontSize: "1.2rem", fontWeight: 800
          }}>
            {"NEW ORDER RECEIVED!"}
          </div>
        )}

        {/* Header */}
        <div style={{
          background: "#111", padding: "14px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "2px solid #222"
        }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {restaurant ? restaurant.name : "Kitchen"}{" — Kitchen Display"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>
              {"Auto refreshes every 5 seconds"}
              {lastUpdated ? " — Last: " + lastUpdated : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: "NEW", count: newOrders.length, color: "#FF3008" },
              { label: "PREPARING", count: preparingOrders.length, color: "#007BFF" },
              { label: "READY", count: readyOrders.length, color: "#28A745" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Columns */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          height: "calc(100vh - 76px)"
        }}>

          {/* New Orders Column */}
          <div style={{ borderRight: "2px solid #222", padding: "16px", overflowY: "auto" }}>
            <div style={{
              background: "#FF3008", borderRadius: "10px", padding: "10px 16px",
              marginBottom: "16px", textAlign: "center", fontWeight: 800,
              fontSize: "0.95rem", letterSpacing: "1px"
            }}>
              {"NEW ORDERS (" + newOrders.length + ")"}
            </div>
            {newOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#444", fontSize: "0.9rem" }}>
                {"No new orders"}
              </div>
            ) : newOrders.map((order) => (
              <div key={order.id} style={{
                background: "#1A1A1A", borderRadius: "14px", padding: "16px",
                marginBottom: "12px", border: "2px solid #FF3008"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>{order.id}</div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>
                      {timeAgo(order.timestamp)}
                    </div>
                  </div>
                  <div style={{
                    background: "#FF3008", color: "#fff",
                    padding: "6px 14px", borderRadius: "20px", fontWeight: 800
                  }}>
                    {"T" + order.tableNumber}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "10px", marginBottom: "12px" }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.9rem", marginBottom: "6px"
                    }}>
                      <span style={{ fontWeight: 600 }}>{item.emoji + " " + item.name}</span>
                      <span style={{
                        background: "#FF3008", color: "#fff", padding: "2px 8px",
                        borderRadius: "6px", fontWeight: 800, fontSize: "0.85rem"
                      }}>
                        {"x" + item.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => updateStatus(order.id, "Preparing")}
                  style={{
                    width: "100%", background: "#007BFF", color: "#fff",
                    border: "none", padding: "12px", borderRadius: "10px",
                    fontWeight: 800, cursor: "pointer", fontSize: "0.95rem",
                    fontFamily: "sans-serif"
                  }}>
                  {"Start Preparing"}
                </button>
              </div>
            ))}
          </div>

          {/* Preparing Column */}
          <div style={{ borderRight: "2px solid #222", padding: "16px", overflowY: "auto" }}>
            <div style={{
              background: "#007BFF", borderRadius: "10px", padding: "10px 16px",
              marginBottom: "16px", textAlign: "center", fontWeight: 800,
              fontSize: "0.95rem", letterSpacing: "1px"
            }}>
              {"PREPARING (" + preparingOrders.length + ")"}
            </div>
            {preparingOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#444", fontSize: "0.9rem" }}>
                {"Nothing preparing"}
              </div>
            ) : preparingOrders.map((order) => (
              <div key={order.id} style={{
                background: "#1A1A1A", borderRadius: "14px", padding: "16px",
                marginBottom: "12px", border: "2px solid #007BFF"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>{order.id}</div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>
                      {timeAgo(order.timestamp)}
                    </div>
                  </div>
                  <div style={{
                    background: "#007BFF", color: "#fff",
                    padding: "6px 14px", borderRadius: "20px", fontWeight: 800
                  }}>
                    {"T" + order.tableNumber}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "10px", marginBottom: "12px" }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.9rem", marginBottom: "6px"
                    }}>
                      <span style={{ fontWeight: 600 }}>{item.emoji + " " + item.name}</span>
                      <span style={{
                        background: "#007BFF", color: "#fff", padding: "2px 8px",
                        borderRadius: "6px", fontWeight: 800, fontSize: "0.85rem"
                      }}>
                        {"x" + item.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  style={{
                    width: "100%", background: "#28A745", color: "#fff",
                    border: "none", padding: "12px", borderRadius: "10px",
                    fontWeight: 800, cursor: "pointer", fontSize: "0.95rem",
                    fontFamily: "sans-serif"
                  }}>
                  {"Mark Ready"}
                </button>
              </div>
            ))}
          </div>

          {/* Ready Column */}
          <div style={{ padding: "16px", overflowY: "auto" }}>
            <div style={{
              background: "#28A745", borderRadius: "10px", padding: "10px 16px",
              marginBottom: "16px", textAlign: "center", fontWeight: 800,
              fontSize: "0.95rem", letterSpacing: "1px"
            }}>
              {"READY TO SERVE (" + readyOrders.length + ")"}
            </div>
            {readyOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#444", fontSize: "0.9rem" }}>
                {"Nothing ready"}
              </div>
            ) : readyOrders.map((order) => (
              <div key={order.id} style={{
                background: "#1A1A1A", borderRadius: "14px", padding: "16px",
                marginBottom: "12px", border: "2px solid #28A745"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>{order.id}</div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>
                      {timeAgo(order.timestamp)}
                    </div>
                  </div>
                  <div style={{
                    background: "#28A745", color: "#fff",
                    padding: "6px 14px", borderRadius: "20px", fontWeight: 800
                  }}>
                    {"T" + order.tableNumber}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "10px", marginBottom: "12px" }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.9rem", marginBottom: "6px"
                    }}>
                      <span style={{ fontWeight: 600 }}>{item.emoji + " " + item.name}</span>
                      <span style={{
                        background: "#28A745", color: "#fff", padding: "2px 8px",
                        borderRadius: "6px", fontWeight: 800, fontSize: "0.85rem"
                      }}>
                        {"x" + item.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => updateStatus(order.id, "Delivered")}
                  style={{
                    width: "100%", background: "#6C757D", color: "#fff",
                    border: "none", padding: "12px", borderRadius: "10px",
                    fontWeight: 800, cursor: "pointer", fontSize: "0.95rem",
                    fontFamily: "sans-serif"
                  }}>
                  {"Delivered"}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}