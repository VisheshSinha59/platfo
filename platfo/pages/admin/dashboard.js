import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const STATUS_FLOW = ["New", "Preparing", "Ready", "Delivered"];
const STATUS_COLOR = {
  New:       { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  Preparing: { bg: "#CCE5FF", text: "#004085", dot: "#007BFF" },
  Ready:     { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  Delivered: { bg: "#E2E3E5", text: "#383D41", dot: "#6C757D" },
};
const EMOJIS = ["🍔","🍕","🍟","🥤","🍜","🍱","🌮","🍣","🍗","🥗","🍩","🍦","🍛","🥪","🍝"];

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeDateBtn, setActiveDateBtn] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", emoji: "🍔", desc: "", tag: "" });
  const [editItem, setEditItem] = useState(null);
  const [itemError, setItemError] = useState("");
  const [saving, setSaving] = useState(false);
  const [settingName, setSettingName] = useState("");
  const [settingTables, setSettingTables] = useState("");
  const [settingSaved, setSettingSaved] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("restaurant");
    if (!stored) { router.push("/admin"); return; }
    const r = JSON.parse(stored);
    setRestaurant(r);
    setRestaurantId(r.id);
    setMenu(r.menu || []);
    setSettingName(r.name);
    setSettingTables(r.tableCount);
  }, [router]);

  const fetchOrders = useCallback(async (sDate, eDate) => {
    if (!restaurantId) return;
    setLoadingOrders(true);
    try {
      let url = "/api/order?restaurantId=" + restaurantId;
      if (sDate) url += "&startDate=" + sDate;
      if (eDate) url += "&endDate=" + eDate;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders("", "");
      const interval = setInterval(() => fetchOrders(startDate, endDate), 10000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const handleDateBtn = (type) => {
    setActiveDateBtn(type);
    const today = new Date();
    if (type === "today") {
      const d = todayStr();
      setStartDate(d); setEndDate(d);
      fetchOrders(d, d);
    } else if (type === "yesterday") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      const ds = d.toISOString().split("T")[0];
      setStartDate(ds); setEndDate(ds);
      fetchOrders(ds, ds);
    } else if (type === "week") {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      const ds = d.toISOString().split("T")[0];
      setStartDate(ds); setEndDate(todayStr());
      fetchOrders(ds, todayStr());
    } else if (type === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      const ds = d.toISOString().split("T")[0];
      setStartDate(ds); setEndDate(todayStr());
      fetchOrders(ds, todayStr());
    } else if (type === "all") {
      setStartDate(""); setEndDate("");
      fetchOrders("", "");
    }
  };

  const refreshMenu = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch("/api/restaurant?id=" + restaurantId);
      const data = await res.json();
      if (data.restaurant) {
        setMenu(data.restaurant.menu || []);
        const stored = JSON.parse(localStorage.getItem("restaurant"));
        stored.menu = data.restaurant.menu;
        localStorage.setItem("restaurant", JSON.stringify(stored));
      }
    } catch {}
  }, [restaurantId]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      await fetchOrders(startDate, endDate);
    } finally { setUpdatingId(null); }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) { setItemError("Name and price required."); return; }
    setSaving(true); setItemError("");
    try {
      const res = await fetch("/api/restaurant?action=addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, ...newItem }),
      });
      if (!res.ok) throw new Error("Failed.");
      await refreshMenu();
      setNewItem({ name: "", price: "", emoji: "🍔", desc: "", tag: "" });
      setShowAddItem(false);
    } catch (e) { setItemError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdateItem = async () => {
    if (!editItem.name || !editItem.price) { setItemError("Name and price required."); return; }
    setSaving(true); setItemError("");
    try {
      const res = await fetch("/api/restaurant?action=updateItem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, itemId: editItem.id, ...editItem }),
      });
      if (!res.ok) throw new Error("Failed.");
      await refreshMenu();
      setEditItem(null);
    } catch (e) { setItemError(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch("/api/restaurant?action=deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, itemId }),
      });
      await refreshMenu();
    } catch {}
  };

  const handleSaveSettings = async () => {
    try {
      await fetch("/api/restaurant?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restaurantId, name: settingName, tableCount: settingTables }),
      });
      const stored = JSON.parse(localStorage.getItem("restaurant"));
      stored.name = settingName;
      stored.tableCount = Number(settingTables);
      localStorage.setItem("restaurant", JSON.stringify(stored));
      setRestaurant(stored);
      setSettingSaved(true);
      setTimeout(() => setSettingSaved(false), 2000);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("restaurant");
    router.push("/admin");
  };

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      {"Loading..."}
    </div>
  );

  const statusTabs = ["All", ...STATUS_FLOW];
  const filteredOrders = statusFilter === "All" ? orders : orders.filter((o) => o.status === statusFilter);
  const counts = STATUS_FLOW.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {});
  const totalRevenue = orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + (o.total || 0), 0);

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "2px solid #EEE", fontSize: "0.95rem", outline: "none",
    fontFamily: "sans-serif", marginTop: "4px", boxSizing: "border-box"
  };

  const menuUrl = typeof window !== "undefined"
    ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=1"
    : "/menu?restaurantId=" + restaurantId + "&table=1";

  const kitchenUrl = "/kitchen/" + restaurantId;
  const tablesUrl = "/admin/tables";

  return (
    <>
      <Head><title>{"Admin " + restaurant.name}</title></Head>
      <div style={{ minHeight: "100vh", background: "#F0F2F5", fontFamily: "sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#111", color: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{restaurant.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#FF3008", marginTop: "2px", fontWeight: 600 }}>{"Admin Panel"}</div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <a href={menuUrl} target="_blank" rel="noreferrer" style={{ background: "#FF3008", color: "#fff", padding: "8px 14px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                {"View Menu"}
              </a>
              <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "sans-serif" }}>
                {"Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto" }}>
            {["orders", "menu", "settings", "qrcodes"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, color: tab === t ? "#FF3008" : "#888", borderBottom: tab === t ? "3px solid #FF3008" : "3px solid transparent", textTransform: "capitalize", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                {t === "qrcodes" ? "QR Codes" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <a href={tablesUrl} style={{ padding: "14px 20px", fontSize: "0.9rem", fontWeight: 700, color: "#888", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
              {"Table History"}
            </a>
            <a href={kitchenUrl} target="_blank" rel="noreferrer" style={{ padding: "14px 20px", fontSize: "0.9rem", fontWeight: 700, color: "#888", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
              {"Kitchen Display"}
            </a>
          </div>
        </div>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Total Orders", value: orders.length },
                  { label: "New", value: counts["New"] || 0 },
                  { label: "Pending", value: orders.filter((o) => o.status !== "Delivered").length },
                  { label: "Revenue", value: "Rs. " + totalRevenue },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: "#fff", borderRadius: "16px", padding: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FF3008" }}>{stat.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px", fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Date Filter */}
              <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <p style={{ fontWeight: 800, color: "#111", marginBottom: "14px", fontSize: "1rem" }}>{"Filter by Date"}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {[
                    { key: "all", label: "All Time" },
                    { key: "today", label: "Today" },
                    { key: "yesterday", label: "Yesterday" },
                    { key: "week", label: "Last 7 Days" },
                    { key: "month", label: "This Month" },
                  ].map((btn) => (
                    <button key={btn.key} onClick={() => handleDateBtn(btn.key)} style={{ padding: "9px 18px", borderRadius: "20px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "sans-serif", border: activeDateBtn === btn.key ? "2px solid #FF3008" : "2px solid #EEE", background: activeDateBtn === btn.key ? "#FF3008" : "#F9F9F9", color: activeDateBtn === btn.key ? "#fff" : "#555", transition: "all 0.15s" }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px" }}>{"From Date"}</label>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveDateBtn("custom"); }} style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #EEE", fontSize: "0.9rem", outline: "none", fontFamily: "sans-serif" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px" }}>{"To Date"}</label>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveDateBtn("custom"); }} style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #EEE", fontSize: "0.9rem", outline: "none", fontFamily: "sans-serif" }} />
                  </div>
                  <button onClick={() => fetchOrders(startDate, endDate)} style={{ padding: "10px 22px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", fontFamily: "sans-serif" }}>
                    {"Search"}
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "16px", display: "flex", overflowX: "auto" }}>
                {statusTabs.map((t) => (
                  <button key={t} onClick={() => setStatusFilter(t)} style={{ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: statusFilter === t ? "#FF3008" : "#888", borderBottom: statusFilter === t ? "3px solid #FF3008" : "3px solid transparent", whiteSpace: "nowrap", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
                    {t}
                    {t !== "All" && counts[t] > 0 && (
                      <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "10px" }}>{counts[t]}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Orders Grid */}
              {loadingOrders ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#AAA" }}>{"Loading orders..."}</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#AAA" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📋</div>
                  <p style={{ fontWeight: 600 }}>{"No orders found."}</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "8px", color: "#BBB" }}>{"Try clicking All Time to see all orders."}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {filteredOrders.map((order) => {
                    const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                    const isUpdating = updatingId === order.id;
                    const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                    const gst = order.gst || Math.round(subtotal * 0.18);
                    const total = order.total || subtotal + gst;
                    const receiptUrl = "/receipt/" + order.id + "?restaurantId=" + restaurantId;
                    return (
                      <div key={order.id} style={{ background: "#fff", borderRadius: "18px", padding: "18px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1.5px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "12px" }}>

                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 800, color: "#111" }}>{order.id}</div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>
                              {formatDate(order.timestamp) + " at " + formatTime(order.timestamp)}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <div style={{ background: "#111", color: "#fff", padding: "5px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
                              {"Table " + order.tableNumber}
                            </div>
                            <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ background: "#F0F0F0", color: "#111", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                              {"Print"}
                            </a>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{ borderTop: "1px dashed #EEE", borderBottom: "1px dashed #EEE", padding: "10px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#444" }}>
                              <span>{item.emoji + " " + item.name + " x" + item.qty}</span>
                              <span style={{ fontWeight: 700 }}>{"Rs." + item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bill */}
                        <div style={{ background: "#111", borderRadius: "12px", padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                            <span style={{ color: "#aaa" }}>{"Subtotal"}</span>
                            <span style={{ color: "#fff" }}>{"Rs. " + subtotal}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", paddingBottom: "8px", borderBottom: "1px dashed #333", marginBottom: "6px" }}>
                            <span style={{ color: "#aaa" }}>{"GST (18%)"}</span>
                            <span style={{ color: "#FF6B35" }}>{"+ Rs. " + gst}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#fff", fontWeight: 700 }}>{"Total"}</span>
                            <span style={{ color: "#FF3008", fontWeight: 800, fontSize: "1.1rem" }}>{"Rs. " + total}</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.78rem", color: "#888" }}>{"Status"}</span>
                          <span style={{ background: sc.bg, color: sc.text, padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                            {order.status}
                          </span>
                        </div>

                        {/* Status Buttons */}
                        <div style={{ display: "flex", gap: "6px" }}>
                          {STATUS_FLOW.map((s) => (
                            <button key={s} onClick={() => updateStatus(order.id, s)} disabled={isUpdating} style={{ flex: 1, padding: "6px 2px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", border: order.status === s ? "1.5px solid " + sc.dot : "1.5px solid #DDD", background: order.status === s ? sc.dot : "#F9F9F9", color: order.status === s ? "#fff" : "#666", fontFamily: "sans-serif" }}>
                              {s}
                            </button>
                          ))}
                        </div>

                        {nextStatus && (
                          <button onClick={() => updateStatus(order.id, nextStatus)} disabled={isUpdating} style={{ width: "100%", background: isUpdating ? "#999" : "#FF3008", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                            {isUpdating ? "Updating..." : "Mark as " + nextStatus + " →"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MENU TAB */}
          {tab === "menu" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111" }}>{"Menu Items"}</h2>
                <button onClick={() => { setShowAddItem(true); setEditItem(null); setItemError(""); }} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                  {"+ Add Item"}
                </button>
              </div>

              {(showAddItem || editItem) && (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "2px solid #FF3008", boxShadow: "0 4px 20px rgba(255,48,8,0.1)" }}>
                  <h3 style={{ fontWeight: 800, color: "#111", marginBottom: "16px" }}>
                    {editItem ? "Edit Item" : "Add New Item"}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>{"Item Name"}</label>
                      <input style={inputStyle} placeholder="e.g. Paneer Tikka"
                        value={editItem ? editItem.name : newItem.name}
                        onChange={(e) => editItem ? setEditItem({ ...editItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>{"Price (Rs.)"}</label>
                      <input style={inputStyle} type="number" placeholder="e.g. 150"
                        value={editItem ? editItem.price : newItem.price}
                        onChange={(e) => editItem ? setEditItem({ ...editItem, price: e.target.value }) : setNewItem({ ...newItem, price: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>{"Description"}</label>
                      <input style={inputStyle} placeholder="Short description"
                        value={editItem ? editItem.desc : newItem.desc}
                        onChange={(e) => editItem ? setEditItem({ ...editItem, desc: e.target.value }) : setNewItem({ ...newItem, desc: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>{"Tag (optional)"}</label>
                      <input style={inputStyle} placeholder="e.g. Bestseller"
                        value={editItem ? editItem.tag : newItem.tag}
                        onChange={(e) => editItem ? setEditItem({ ...editItem, tag: e.target.value }) : setNewItem({ ...newItem, tag: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "8px" }}>{"Emoji"}</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {EMOJIS.map((e) => (
                        <button key={e} onClick={() => editItem ? setEditItem({ ...editItem, emoji: e }) : setNewItem({ ...newItem, emoji: e })}
                          style={{ width: "40px", height: "40px", borderRadius: "10px", fontSize: "1.3rem", border: (editItem ? editItem.emoji : newItem.emoji) === e ? "2.5px solid #FF3008" : "2px solid #EEE", background: (editItem ? editItem.emoji : newItem.emoji) === e ? "#FFF0EE" : "#F9F9F9", cursor: "pointer" }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  {itemError && <div style={{ color: "#D00000", fontSize: "0.85rem", marginTop: "10px" }}>{itemError}</div>}
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button onClick={editItem ? handleUpdateItem : handleAddItem} disabled={saving}
                      style={{ background: saving ? "#999" : "#FF3008", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "sans-serif" }}>
                      {saving ? "Saving..." : editItem ? "Update Item" : "Add Item"}
                    </button>
                    <button onClick={() => { setShowAddItem(false); setEditItem(null); setItemError(""); }}
                      style={{ background: "#F5F5F5", color: "#555", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                      {"Cancel"}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {menu.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#AAA" }}>{"No menu items yet. Click Add Item!"}</div>
                ) : menu.map((item) => (
                  <div key={item.id} style={{ background: "#fff", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #F0EBE3" }}>
                    <div style={{ width: "56px", height: "56px", background: "#FFF5F2", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: "#111" }}>{item.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "2px" }}>{item.desc}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FF3008", marginTop: "4px" }}>{"Rs. " + item.price}</div>
                    </div>
                    {item.tag !== "" && (
                      <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>{item.tag}</span>
                    )}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button onClick={() => { setEditItem({ ...item }); setShowAddItem(false); setItemError(""); }}
                        style={{ background: "#F0F0F0", border: "none", padding: "8px 14px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "sans-serif" }}>
                        {"Edit"}
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)}
                        style={{ background: "#FFF0F0", border: "none", color: "#D00000", padding: "8px 14px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "sans-serif" }}>
                        {"Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div style={{ maxWidth: "480px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", marginBottom: "24px" }}>{"Restaurant Settings"}</h2>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px" }}>{"Restaurant Name"}</label>
                  <input style={inputStyle} value={settingName} onChange={(e) => setSettingName(e.target.value)} placeholder="Restaurant name" />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px" }}>{"Number of Tables"}</label>
                  <input style={inputStyle} type="number" value={settingTables} onChange={(e) => setSettingTables(e.target.value)} placeholder="e.g. 10" min="1" max="50" />
                </div>
                <button onClick={handleSaveSettings} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "1rem", fontFamily: "sans-serif" }}>
                  {settingSaved ? "Saved!" : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {/* QR CODES TAB */}
          {tab === "qrcodes" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", marginBottom: "8px" }}>{"QR Code Links"}</h2>
              <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "20px" }}>{"Share these links or generate QR codes for each table."}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Array.from({ length: Number(restaurant.tableCount) }, (_, i) => i + 1).map((t) => {
                  const url = typeof window !== "undefined"
                    ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=" + t
                    : "/menu?restaurantId=" + restaurantId + "&table=" + t;
                  return (
                    <div key={t} style={{ background: "#fff", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ background: "#FF3008", color: "#fff", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.95rem", flexShrink: 0 }}>
                        {t}
                      </div>
                      <div style={{ flex: 1, fontSize: "0.82rem", color: "#555", wordBreak: "break-all" }}>{url}</div>
                      <button onClick={() => navigator.clipboard.writeText(url)}
                        style={{ background: "#F5F5F5", border: "none", padding: "8px 14px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "sans-serif", flexShrink: 0 }}>
                        {"Copy"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}