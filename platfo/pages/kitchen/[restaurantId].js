import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Kitchen() {
  const router = useRouter();
  const { restaurantId } = router.query;
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const STATUS_FLOW = ["New", "Preparing", "Ready", "Delivered"];
  const STATUS_COLOR = {
    New:       { bg: "rgba(255,193,7,0.15)", text: "#FFC107", dot: "#FFC107", border: "rgba(255,193,7,0.3)" },
    Preparing: { bg: "rgba(129,140,248,0.15)", text: "#818CF8", dot: "#818CF8", border: "rgba(129,140,248,0.3)" },
    Ready:     { bg: "rgba(74,222,128,0.15)", text: "#4ADE80", dot: "#4ADE80", border: "rgba(74,222,128,0.3)" },
    Delivered: { bg: "rgba(148,163,184,0.15)", text: "#94A3B8", dot: "#94A3B8", border: "rgba(148,163,184,0.3)" },
  };

  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch("/api/order?restaurantId=" + restaurantId);
      const data = await res.json();
      const activeOrders = (data.orders || []).filter((o) => o.status !== "Delivered");
      setOrders(activeOrders);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch("/api/restaurant?id=" + restaurantId);
      const data = await res.json();
      if (data.restaurant) setRestaurant(data.restaurant);
    } catch {}
  };

  useEffect(() => {
    if (!restaurantId) return;
    fetchRestaurant();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        if (status === "Delivered") {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
          setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
        }
      }
    } catch (err) { console.error(err); }
    finally { setUpdatingId(null); }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const getTimeDiff = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diff < 1) return "Just now";
    if (diff === 1) return "1 min ago";
    return diff + " mins ago";
  };

  const sym = restaurant?.currencySymbol || "₹";
  const tRate = restaurant?.taxRate ?? 18;

  const newOrders = orders.filter((o) => o.status === "New");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const readyOrders = orders.filter((o) => o.status === "Ready");

  return (
    <>
      <Head><title>{"Kitchen — " + (restaurant?.name || "Platfo")}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0A; font-family: 'Segoe UI', sans-serif; color: #fff; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .order-card { animation: fadeIn 0.3s ease; }
        .btn:hover { opacity: 0.85 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>

        {/* Header */}
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "36px", height: "36px", background: "#FF3008", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 0 16px rgba(255,48,8,0.4)" }}>{"👨‍🍳"}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{restaurant?.name || "Kitchen Display"}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
                {"Kitchen Display System"}
                {restaurant?.country && <span style={{ color: "#444" }}>{"· " + sym + " " + (restaurant?.currency || "")}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {[
              { label: "New", count: newOrders.length, color: "#FFC107" },
              { label: "Preparing", count: preparingOrders.length, color: "#818CF8" },
              { label: "Ready", count: readyOrders.length, color: "#4ADE80" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "6px 14px", textAlign: "center", minWidth: "70px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: "0.62rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "8px", padding: "6px 12px" }}>
              <div style={{ width: "6px", height: "6px", background: "#4ADE80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "0.72rem", color: "#4ADE80", fontWeight: 600 }}>{"Live · 5s"}</span>
            </div>

            {lastUpdated && (
              <div style={{ fontSize: "0.7rem", color: "#444" }}>
                {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", border: "3px solid rgba(255,48,8,0.2)", borderTop: "3px solid #FF3008", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "#555" }}>{"Loading orders..."}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", height: "calc(100vh - 69px)" }}>

            {/* NEW */}
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,193,7,0.04)" }}>
                <div style={{ width: "8px", height: "8px", background: "#FFC107", borderRadius: "50%", animation: newOrders.length > 0 ? "pulse 1s infinite" : "none" }} />
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#FFC107" }}>{"NEW ORDERS"}</span>
                <span style={{ background: "rgba(255,193,7,0.15)", color: "#FFC107", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, marginLeft: "auto" }}>{newOrders.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                {newOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.3 }}>{"✓"}</div>
                    <p style={{ fontSize: "0.82rem" }}>{"No new orders"}</p>
                  </div>
                ) : newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} sc={STATUS_COLOR["New"]} nextStatus="Preparing" updateStatus={updateStatus} updatingId={updatingId} formatTime={formatTime} getTimeDiff={getTimeDiff} sym={sym} tRate={tRate} />
                ))}
              </div>
            </div>

            {/* PREPARING */}
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(129,140,248,0.04)" }}>
                <div style={{ width: "8px", height: "8px", background: "#818CF8", borderRadius: "50%", animation: preparingOrders.length > 0 ? "pulse 1.5s infinite" : "none" }} />
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#818CF8" }}>{"PREPARING"}</span>
                <span style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, marginLeft: "auto" }}>{preparingOrders.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                {preparingOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.3 }}>{"🍳"}</div>
                    <p style={{ fontSize: "0.82rem" }}>{"Nothing preparing"}</p>
                  </div>
                ) : preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} sc={STATUS_COLOR["Preparing"]} nextStatus="Ready" updateStatus={updateStatus} updatingId={updatingId} formatTime={formatTime} getTimeDiff={getTimeDiff} sym={sym} tRate={tRate} />
                ))}
              </div>
            </div>

            {/* READY */}
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(74,222,128,0.04)" }}>
                <div style={{ width: "8px", height: "8px", background: "#4ADE80", borderRadius: "50%", animation: readyOrders.length > 0 ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#4ADE80" }}>{"READY TO SERVE"}</span>
                <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ADE80", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, marginLeft: "auto" }}>{readyOrders.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                {readyOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.3 }}>{"🛎️"}</div>
                    <p style={{ fontSize: "0.82rem" }}>{"Nothing ready yet"}</p>
                  </div>
                ) : readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} sc={STATUS_COLOR["Ready"]} nextStatus="Delivered" updateStatus={updateStatus} updatingId={updatingId} formatTime={formatTime} getTimeDiff={getTimeDiff} sym={sym} tRate={tRate} />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({ order, sc, nextStatus, updateStatus, updatingId, formatTime, getTimeDiff, sym, tRate }) {
  const isUpdating = updatingId === order.id;
  const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = order.gst || Math.round(subtotal * tRate / 100);
  const total = order.total || subtotal + tax;

  return (
    <div className="order-card" style={{ background: "#161616", borderRadius: "14px", padding: "16px", marginBottom: "10px", border: "1px solid " + sc.border }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{order.id}</div>
          <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "2px" }}>{getTimeDiff(order.timestamp) + " · " + formatTime(order.timestamp)}</div>
          {order.customerName && <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "3px" }}>{order.customerName}</div>}
          {order.paymentMethod && (
            <div style={{ fontSize: "0.68rem", marginTop: "3px" }}>
              {order.paymentMethod === "online" ?
                <span style={{ color: "#818CF8", fontWeight: 600 }}>{"💳 Paid Online"}</span> :
                <span style={{ color: "#FFC107", fontWeight: 600 }}>{"💵 Cash"}</span>
              }
            </div>
          )}
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "5px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 800 }}>{"T" + order.tableNumber}</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < order.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: sc.bg, color: sc.text, fontWeight: 800, fontSize: "0.78rem", padding: "2px 7px", borderRadius: "6px", minWidth: "24px", textAlign: "center" }}>{item.qty}</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.name}</span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#555" }}>{sym + item.price * item.qty}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.72rem", color: "#444" }}>{"Total"}</span>
          <span style={{ fontWeight: 800, color: sc.text, fontSize: "0.88rem" }}>{sym + total}</span>
        </div>
      </div>

      <button className="btn" onClick={() => updateStatus(order.id, nextStatus)} disabled={isUpdating}
        style={{ width: "100%", background: isUpdating ? "#222" : sc.bg, color: isUpdating ? "#444" : sc.text, border: "1px solid " + sc.border, padding: "11px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: "sans-serif", transition: "all 0.2s" }}>
        {isUpdating ? "Updating..." : nextStatus === "Delivered" ? "✓ Mark as Delivered" : "→ Move to " + nextStatus}
      </button>
    </div>
  );
}
