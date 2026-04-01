import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Tables() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("restaurant");
    if (!stored) { router.push("/admin"); return; }
    const r = JSON.parse(stored);
    setRestaurant(r);
    setRestaurantId(r.id);
  }, [router]);

  useEffect(() => {
    if (!restaurantId) return;
    const tok = localStorage.getItem("token");
    fetch("/api/order?restaurantId=" + restaurantId, {
      headers: { "Authorization": "Bearer " + tok }
    })
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,48,8,0.2)", borderTop: "3px solid #FF3008", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#555" }}>{"Loading..."}</p>
      </div>
    </div>
  );

  const tableCount = restaurant.tableCount || 10;
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const getTableOrders = (tableNum) => orders.filter((o) => o.tableNumber === tableNum);
  const getTableRevenue = (tableNum) => getTableOrders(tableNum).filter((o) => o.status === "Delivered").reduce((s, o) => s + (o.total || 0), 0);

  const getTableStatus = (tableNum) => {
    const tableOrders = getTableOrders(tableNum);
    if (tableOrders.some((o) => o.status === "New")) return "new";
    if (tableOrders.some((o) => o.status === "Preparing")) return "preparing";
    if (tableOrders.some((o) => o.status === "Ready")) return "ready";
    if (tableOrders.length > 0) return "served";
    return "empty";
  };

  const statusConfig = {
    new:       { color: "#FFC107", bg: "rgba(255,193,7,0.1)",    label: "New Order", border: "rgba(255,193,7,0.3)" },
    preparing: { color: "#818CF8", bg: "rgba(129,140,248,0.1)", label: "Preparing",  border: "rgba(129,140,248,0.3)" },
    ready:     { color: "#4ADE80", bg: "rgba(74,222,128,0.1)",   label: "Ready",      border: "rgba(74,222,128,0.3)" },
    served:    { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label: "Served",      border: "rgba(148,163,184,0.3)" },
    empty:     { color: "#333",    bg: "rgba(255,255,255,0.02)", label: "Empty",       border: "rgba(255,255,255,0.06)" },
  };

  const totalRevenue = orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "Delivered").length;

  const selectedTableOrders = selectedTable ? getTableOrders(selectedTable) : [];
  const filteredOrders = selectedTableOrders.filter((o) =>
    !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const formatTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const STATUS_COLOR = {
    New:       { bg: "rgba(255,193,7,0.15)",    text: "#FFC107" },
    Preparing: { bg: "rgba(129,140,248,0.15)",  text: "#818CF8" },
    Ready:     { bg: "rgba(74,222,128,0.15)",   text: "#4ADE80" },
    Delivered: { bg: "rgba(148,163,184,0.15)",  text: "#94A3B8" },
  };

  return (
    <>
      <Head><title>{"Table History — " + restaurant.name}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0F0F0F; font-family: 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; border-color: rgba(255,48,8,0.4) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0F0F0F", color: "#fff" }}>

        {/* Header */}
        <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.push("/admin/dashboard")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#888", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{"←"}</button>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{"📋 Table History"}</div>
              <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "1px" }}>{restaurant.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { label: "Revenue", value: "₹" + totalRevenue, color: "#4ADE80" },
              { label: "Active", value: activeOrders, color: "#FFC107" },
              { label: "Total", value: orders.length, color: "#818CF8" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "0.65rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", height: "calc(100vh - 69px)" }}>

          {/* Left — Tables Grid */}
          <div style={{ width: "320px", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px", fontWeight: 600 }}>{"Tables · " + tableCount + " total"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {Object.entries(statusConfig).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: val.color }}>
                  <div style={{ width: "6px", height: "6px", background: val.color, borderRadius: "50%" }} />
                  {val.label}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {loading ? (
                Array.from({ length: tableCount }, (_, i) => (
                  <div key={i} style={{ aspectRatio: "1", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }} />
                ))
              ) : (
                tables.map((t) => {
                  const status = getTableStatus(t);
                  const conf = statusConfig[status];
                  const orderCount = getTableOrders(t).length;
                  const isSelected = selectedTable === t;
                  return (
                    <button key={t} onClick={() => setSelectedTable(isSelected ? null : t)}
                      style={{ aspectRatio: "1", background: isSelected ? "rgba(255,48,8,0.15)" : conf.bg, border: isSelected ? "2px solid #FF3008" : "1px solid " + conf.border, borderRadius: "12px", cursor: "pointer", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", transition: "all 0.2s", position: "relative" }}>
                      {status !== "empty" && (
                        <div style={{ position: "absolute", top: "4px", right: "4px", width: "6px", height: "6px", background: conf.color, borderRadius: "50%", animation: status === "new" ? "pulse 1s infinite" : "none" }} />
                      )}
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: isSelected ? "#FF3008" : status === "empty" ? "#333" : conf.color }}>{t}</span>
                      {orderCount > 0 && <span style={{ fontSize: "0.55rem", color: conf.color, fontWeight: 600 }}>{orderCount + " orders"}</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right — Order Details */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {!selectedTable ? (
              <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.2 }}>{"🪑"}</div>
                <p style={{ color: "#333", fontWeight: 600, fontSize: "1rem" }}>{"Select a table"}</p>
                <p style={{ color: "#2a2a2a", fontSize: "0.82rem", marginTop: "6px" }}>{"Click any table on the left to view its order history"}</p>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"Table " + selectedTable}</h2>
                    <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "3px" }}>{selectedTableOrders.length + " orders · ₹" + getTableRevenue(selectedTable) + " revenue"}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "0.82rem", fontFamily: "sans-serif", width: "180px" }} />
                    <button onClick={() => setSelectedTable(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#666", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}>{"×"}</button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", background: "#161616", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.2 }}>{"📋"}</div>
                    <p style={{ color: "#444" }}>{search ? "No orders matching search." : "No orders for this table."}</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredOrders.map((order) => {
                      const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                      const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                      const gst = order.gst || Math.round(subtotal * 0.18);
                      const total = order.total || subtotal + gst;
                      return (
                        <div key={order.id} style={{ background: "#161616", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{order.id}</div>
                              <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "3px" }}>{formatDate(order.timestamp) + " · " + formatTime(order.timestamp)}</div>
                              {order.customerName && <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>{order.customerName + " · " + order.customerPhone}</div>}
                              {order.paymentMethod && (
                                <div style={{ fontSize: "0.72rem", marginTop: "3px" }}>
                                  {order.paymentMethod === "online" ?
                                    <span style={{ color: "#818CF8", fontWeight: 600 }}>{"💳 Paid Online"}</span> :
                                    <span style={{ color: "#FFC107", fontWeight: 600 }}>{"💵 Pay by Cash"}</span>
                                  }
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <div style={{ background: sc.bg, color: sc.text, padding: "4px 10px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700 }}>{order.status}</div>
                              <button onClick={() => window.open("/receipt/" + order.id + "?restaurantId=" + restaurantId, "_blank")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#666", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontFamily: "sans-serif", fontWeight: 600 }}>{"🖨️ Print"}</button>
                            </div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                                <span style={{ color: "#666" }}>{item.name + " × " + item.qty}</span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{"₹" + item.price * item.qty}</span>
                              </div>
                            ))}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "4px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#444", marginBottom: "4px" }}>
                                <span>{"GST (18%)"}</span><span>{"₹" + gst}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{"Total"}</span>
                                <span style={{ fontWeight: 800, color: "#FF3008", fontSize: "0.95rem" }}>{"₹" + total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
