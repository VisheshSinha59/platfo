
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const STATUS_FLOW = ["New", "Preparing", "Ready", "Delivered"];
const STATUS_COLOR = {
  New:       { bg: "rgba(255,193,7,0.15)", text: "#FFC107", dot: "#FFC107" },
  Preparing: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", dot: "#818CF8" },
  Ready:     { bg: "rgba(34,197,94,0.15)", text: "#4ADE80", dot: "#4ADE80" },
  Delivered: { bg: "rgba(148,163,184,0.15)", text: "#94A3B8", dot: "#94A3B8" },
};

function getISTDate(offsetDays) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  istDate.setDate(istDate.getDate() + offsetDays);
  return istDate.toISOString().split("T")[0];
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const getToken = () => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};

const NAV_ITEMS = [
  { id: "orders", icon: "⚡", label: "Orders" },
  { id: "menu", icon: "🍽️", label: "Menu" },
  { id: "settings", icon: "⚙️", label: "Settings" },
  { id: "qrcodes", icon: "📱", label: "QR Codes" },
];

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
  const [sections, setSections] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingName, setSettingName] = useState("");
  const [settingTables, setSettingTables] = useState("");
  const [settingSaved, setSettingSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Section states
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editSection, setEditSection] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);

  // Item states
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", desc: "", tag: "", sectionId: "" });
  const [editItem, setEditItem] = useState(null);
  const [itemError, setItemError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("restaurant");
    if (!stored) { router.push("/admin"); return; }
    const r = JSON.parse(stored);
    setRestaurant(r);
    setRestaurantId(r.id);
    setMenu(r.menu || []);
    setSections(r.sections || []);
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
      const res = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) { console.log(err); }
    finally { setLoadingOrders(false); }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) fetchOrders("", "");
  }, [restaurantId]);

  const refreshRestaurant = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch("/api/restaurant?id=" + restaurantId);
      const data = await res.json();
      if (data.restaurant) {
        setMenu(data.restaurant.menu || []);
        setSections(data.restaurant.sections || []);
        const stored = JSON.parse(localStorage.getItem("restaurant"));
        stored.menu = data.restaurant.menu;
        stored.sections = data.restaurant.sections;
        localStorage.setItem("restaurant", JSON.stringify(stored));
      }
    } catch {}
  }, [restaurantId]);

  const handleDateBtn = (type) => {
    setActiveDateBtn(type);
    if (type === "today") { const d = getISTDate(0); setStartDate(d); setEndDate(d); fetchOrders(d, d); }
    else if (type === "yesterday") { const d = getISTDate(-1); setStartDate(d); setEndDate(d); fetchOrders(d, d); }
    else if (type === "week") { const s = getISTDate(-7); const e = getISTDate(0); setStartDate(s); setEndDate(e); fetchOrders(s, e); }
    else if (type === "month") {
      const now = new Date(); const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const first = new Date(istDate.getFullYear(), istDate.getMonth(), 1).toISOString().split("T")[0];
      const today = getISTDate(0); setStartDate(first); setEndDate(today); fetchOrders(first, today);
    } else { setStartDate(""); setEndDate(""); fetchOrders("", ""); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch (err) { console.error(err); }
    finally { setUpdatingId(null); }
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant?action=addSection", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, sectionName: newSectionName }),
      });
      if (res.ok) { await refreshRestaurant(); setNewSectionName(""); setShowAddSection(false); }
    } catch {} finally { setSaving(false); }
  };

  const handleUpdateSection = async () => {
    if (!editSection?.name?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant?action=updateSection", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, sectionId: editSection.id, sectionName: editSection.name }),
      });
      if (res.ok) { await refreshRestaurant(); setEditSection(null); }
    } catch {} finally { setSaving(false); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its items?")) return;
    try {
      await fetch("/api/restaurant?action=deleteSection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, sectionId }),
      });
      await refreshRestaurant();
      if (activeSectionId === sectionId) setActiveSectionId(null);
    } catch {}
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) { setItemError("Name and price required."); return; }
    setSaving(true); setItemError("");
    try {
      const res = await fetch("/api/restaurant?action=addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, ...newItem }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed."); }
      await refreshRestaurant();
      setNewItem({ name: "", price: "", desc: "", tag: "", sectionId: activeSectionId || "" });
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
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, itemId: editItem.id, ...editItem }),
      });
      if (!res.ok) throw new Error("Failed.");
      await refreshRestaurant(); setEditItem(null);
    } catch (e) { setItemError(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch("/api/restaurant?action=deleteItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, itemId }),
      });
      await refreshRestaurant();
    } catch {}
  };

  const handleSaveSettings = async () => {
    try {
      await fetch("/api/restaurant?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ id: restaurantId, name: settingName, tableCount: settingTables }),
      });
      const stored = JSON.parse(localStorage.getItem("restaurant"));
      stored.name = settingName; stored.tableCount = Number(settingTables);
      localStorage.setItem("restaurant", JSON.stringify(stored));
      setRestaurant(stored); setSettingSaved(true);
      setTimeout(() => setSettingSaved(false), 2000);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("restaurant");
    localStorage.removeItem("token");
    router.push("/admin");
  };

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F0F0F", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{"⚡"}</div>
        <p>{"Loading..."}</p>
      </div>
    </div>
  );

  const statusTabs = ["All", ...STATUS_FLOW];
  const filteredOrders = statusFilter === "All" ? orders : orders.filter((o) => o.status === statusFilter);
  const counts = STATUS_FLOW.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {});
  const totalRevenue = orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + (o.total || 0), 0);
  const menuUrl = typeof window !== "undefined" ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=1" : "";
  const sectionItems = (sId) => menu.filter((item) => item.sectionId === Number(sId));
  const unsectionedItems = menu.filter((item) => !item.sectionId);

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
    color: "#fff", fontSize: "0.9rem", outline: "none",
    fontFamily: "sans-serif", marginTop: "4px", boxSizing: "border-box",
    transition: "border 0.2s",
  };

  return (
    <>
      <Head><title>{restaurant.name + " — Platfo"}</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0F0F0F; color: #fff; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: rgba(255,48,8,0.5) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; left: 0 !important; top: 0 !important; height: 100vh !important; z-index: 100 !important; transform: translateX(-100%); transition: transform 0.3s ease !important; }
          .sidebar.open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0F0F0F" }}>

        {/* SIDEBAR */}
        <div className={"sidebar" + (sidebarOpen ? " open" : "")} style={{ width: sidebarOpen ? "240px" : "70px", background: "#161616", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", transition: "width 0.3s ease", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

          {/* Logo */}
          <div style={{ padding: "24px 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div style={{ width: "38px", height: "38px", background: "#FF3008", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, boxShadow: "0 0 20px rgba(255,48,8,0.4)" }}>{"🍽️"}</div>
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.5px" }}>{"Platfo"}</div>
                <div style={{ fontSize: "0.7rem", color: "#FF3008", fontWeight: 600 }}>{"Admin Panel"}</div>
              </div>
            )}
          </div>

          {/* Restaurant Name */}
          {sidebarOpen && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{"Restaurant"}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{restaurant.name}</div>
            </div>
          )}

          {/* Nav Items */}
          <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.88rem", fontWeight: 600, background: tab === item.id ? "rgba(255,48,8,0.15)" : "transparent", color: tab === item.id ? "#FF3008" : "#666", transition: "all 0.2s", textAlign: "left", width: "100%", whiteSpace: "nowrap", borderLeft: tab === item.id ? "2px solid #FF3008" : "2px solid transparent" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </button>
            ))}

            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

            <a href="/admin/tables" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#666", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"📋"}</span>
              {sidebarOpen && "Table History"}
            </a>

            <a href={"/kitchen/" + restaurantId} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#666", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"👨‍🍳"}</span>
              {sidebarOpen && "Kitchen Display"}
            </a>

            <a href={menuUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#666", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"👁️"}</span>
              {sidebarOpen && "View Menu"}
            </a>
          </div>

          {/* Logout */}
          <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.88rem", fontWeight: 600, background: "transparent", color: "#666", width: "100%", textAlign: "left", whiteSpace: "nowrap", transition: "all 0.2s" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"🚪"}</span>
              {sidebarOpen && "Logout"}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Top Bar */}
          <div style={{ background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{"☰"}</button>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{NAV_ITEMS.find(n => n.id === tab)?.icon + " " + (NAV_ITEMS.find(n => n.id === tab)?.label || tab)}</div>
                <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "1px" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ background: "rgba(255,48,8,0.1)", border: "1px solid rgba(255,48,8,0.2)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem", color: "#FF3008", fontWeight: 600 }}>
                {counts["New"] > 0 ? counts["New"] + " New Orders" : "No New Orders"}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div className="fade-in">
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                  {[
                    { label: "Total Orders", value: orders.length, icon: "📦", color: "#818CF8" },
                    { label: "New", value: counts["New"] || 0, icon: "⚡", color: "#FFC107" },
                    { label: "Pending", value: orders.filter(o => o.status !== "Delivered").length, icon: "⏳", color: "#FB923C" },
                    { label: "Revenue", value: "₹" + totalRevenue, icon: "💰", color: "#4ADE80" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#161616", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "3rem", opacity: 0.06 }}>{stat.icon}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{stat.label}</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div style={{ background: "#161616", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[{ key: "all", label: "All Time" }, { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" }, { key: "week", label: "7 Days" }, { key: "month", label: "Month" }].map((btn) => (
                        <button key={btn.key} onClick={() => handleDateBtn(btn.key)} style={{ padding: "7px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "sans-serif", border: activeDateBtn === btn.key ? "1px solid #FF3008" : "1px solid rgba(255,255,255,0.08)", background: activeDateBtn === btn.key ? "rgba(255,48,8,0.15)" : "transparent", color: activeDateBtn === btn.key ? "#FF3008" : "#666", transition: "all 0.2s" }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveDateBtn("custom"); }} style={{ ...inputStyle, width: "auto", marginTop: 0, padding: "7px 12px" }} />
                      <span style={{ color: "#555" }}>{"→"}</span>
                      <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveDateBtn("custom"); }} style={{ ...inputStyle, width: "auto", marginTop: 0, padding: "7px 12px" }} />
                      <button onClick={() => fetchOrders(startDate, endDate)} style={{ padding: "7px 16px", background: "#FF3008", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.8rem" }}>{"Search"}</button>
                    </div>
                  </div>

                  {/* Status Filter Tabs */}
                  <div style={{ display: "flex", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                    {statusTabs.map((t) => (
                      <button key={t} onClick={() => setStatusFilter(t)} style={{ padding: "6px 14px", border: "none", background: statusFilter === t ? "rgba(255,48,8,0.15)" : "transparent", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: statusFilter === t ? "#FF3008" : "#555", borderRadius: "8px", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
                        {t}
                        {t !== "All" && counts[t] > 0 && <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.65rem", padding: "1px 5px", borderRadius: "6px" }}>{counts[t]}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Grid */}
                {loadingOrders ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>{"Loading orders..."}</div>
                ) : filteredOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px", color: "#333", background: "#161616", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px", opacity: 0.3 }}>{"📋"}</div>
                    <p style={{ fontWeight: 600, color: "#444" }}>{"No orders found."}</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                    {filteredOrders.map((order) => {
                      const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                      const isUpdating = updatingId === order.id;
                      const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                      const gst = order.gst || Math.round(subtotal * 0.18);
                      const total = order.total || subtotal + gst;
                      return (
                        <div key={order.id} style={{ background: "#161616", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "14px", transition: "border 0.2s" }}>

                          {/* Order Header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{order.id}</div>
                              <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "3px" }}>{formatDate(order.timestamp) + " · " + formatTime(order.timestamp)}</div>
                              {order.customerName && <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>{order.customerName + " · " + order.customerPhone}</div>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                              <div style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700 }}>{"T" + order.tableNumber}</div>
                              <div style={{ background: sc.bg, color: sc.text, padding: "3px 8px", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot }} />
                                {order.status}
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                                <span style={{ color: "#888" }}>{item.name + " × " + item.qty}</span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{"₹" + item.price * item.qty}</span>
                              </div>
                            ))}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.75rem", color: "#555" }}>{"GST (18%): ₹" + gst}</span>
                              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FF3008" }}>{"₹" + total}</span>
                            </div>
                          </div>

                          {/* Status Buttons */}
                          <div style={{ display: "flex", gap: "4px" }}>
                            {STATUS_FLOW.map((s) => (
                              <button key={s} onClick={() => updateStatus(order.id, s)} disabled={isUpdating || order.status === s}
                                style={{ flex: 1, padding: "6px 2px", borderRadius: "7px", fontSize: "0.65rem", fontWeight: 700, cursor: isUpdating || order.status === s ? "not-allowed" : "pointer", border: order.status === s ? "1px solid " + sc.dot : "1px solid rgba(255,255,255,0.08)", background: order.status === s ? sc.bg : "transparent", color: order.status === s ? sc.text : "#555", fontFamily: "sans-serif", transition: "all 0.2s", opacity: isUpdating ? 0.5 : 1 }}>
                                {s}
                              </button>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: "8px" }}>
                            {nextStatus && (
                              <button onClick={() => updateStatus(order.id, nextStatus)} disabled={isUpdating}
                                style={{ flex: 1, background: isUpdating ? "#333" : "#FF3008", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: "sans-serif", transition: "all 0.2s" }}>
                                {isUpdating ? "..." : "→ " + nextStatus}
                              </button>
                            )}
                            <button onClick={() => window.open("/receipt/" + order.id + "?restaurantId=" + restaurantId, "_blank")}
                              style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "10px 14px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                              {"🖨️"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MENU TAB */}
            {tab === "menu" && (
              <div className="fade-in">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"Menu Management"}</h2>
                    <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{sections.length + " sections · " + menu.length + " items"}</p>
                  </div>
                  <button onClick={() => { setShowAddSection(true); setNewSectionName(""); }} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>{"+ Add Section"}</button>
                </div>

                {showAddSection && (
                  <div style={{ background: "#161616", borderRadius: "14px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,48,8,0.3)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "10px" }}>{"New Section"}</div>
                    <input style={inputStyle} placeholder="e.g. Starters, Main Course, Beverages" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddSection()} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button onClick={handleAddSection} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{saving ? "Saving..." : "Create"}</button>
                      <button onClick={() => setShowAddSection(false)} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {editSection && (
                  <div style={{ background: "#161616", borderRadius: "14px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,48,8,0.3)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "10px" }}>{"Edit Section"}</div>
                    <input style={inputStyle} value={editSection.name} onChange={(e) => setEditSection({ ...editSection, name: e.target.value })} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button onClick={handleUpdateSection} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{saving ? "Saving..." : "Update"}</button>
                      <button onClick={() => setEditSection(null)} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {sections.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px", background: "#161616", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}>{"📂"}</div>
                    <p style={{ color: "#444", fontWeight: 600 }}>{"No sections yet. Create your first section!"}</p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {sections.map((section) => (
                    <div key={section.id} style={{ background: "#161616", borderRadius: "14px", border: activeSectionId === section.id ? "1px solid rgba(255,48,8,0.3)" : "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: activeSectionId === section.id ? "rgba(255,48,8,0.05)" : "transparent" }} onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "6px", height: "6px", background: "#FF3008", borderRadius: "50%" }} />
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{section.name}</span>
                          <span style={{ background: "rgba(255,255,255,0.06)", color: "#666", fontSize: "0.68rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>{sectionItems(section.id).length + " items"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button onClick={(e) => { e.stopPropagation(); setEditSection({ ...section }); setShowAddSection(false); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "5px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.75rem", color: "#888", fontFamily: "sans-serif" }}>{"Edit"}</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} style={{ background: "rgba(255,48,8,0.1)", border: "none", color: "#FF3008", padding: "5px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.75rem", fontFamily: "sans-serif" }}>{"Delete"}</button>
                          <span style={{ color: "#444", fontSize: "0.8rem" }}>{activeSectionId === section.id ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {activeSectionId === section.id && (
                        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ paddingTop: "14px" }}>
                            {showAddItem && (
                              <div style={{ background: "rgba(255,48,8,0.05)", borderRadius: "12px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(255,48,8,0.2)" }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "12px", color: "#FF3008" }}>{"Add Item to " + section.name}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  {[
                                    { label: "Item Name *", key: "name", placeholder: "e.g. Paneer Tikka", type: "text" },
                                    { label: "Price (₹) *", key: "price", placeholder: "e.g. 150", type: "number" },
                                    { label: "Description", key: "desc", placeholder: "Short description", type: "text" },
                                    { label: "Tag", key: "tag", placeholder: "e.g. Bestseller", type: "text" },
                                  ].map((f) => (
                                    <div key={f.key}>
                                      <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                                      <input style={inputStyle} type={f.type} placeholder={f.placeholder} value={newItem[f.key]} onChange={(e) => setNewItem({ ...newItem, [f.key]: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                                {itemError && <div style={{ color: "#FF3008", fontSize: "0.8rem", marginTop: "8px" }}>{itemError}</div>}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                  <button onClick={handleAddItem} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{saving ? "Saving..." : "Add Item"}</button>
                                  <button onClick={() => { setShowAddItem(false); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{"Cancel"}</button>
                                </div>
                              </div>
                            )}

                            {editItem && editItem.sectionId === section.id && (
                              <div style={{ background: "rgba(255,48,8,0.05)", borderRadius: "12px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(255,48,8,0.2)" }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "12px", color: "#FF3008" }}>{"Edit Item"}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  {[
                                    { label: "Item Name *", key: "name", type: "text" },
                                    { label: "Price (₹) *", key: "price", type: "number" },
                                    { label: "Description", key: "desc", type: "text" },
                                    { label: "Tag", key: "tag", type: "text" },
                                  ].map((f) => (
                                    <div key={f.key}>
                                      <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                                      <input style={inputStyle} type={f.type} value={editItem[f.key] || ""} onChange={(e) => setEditItem({ ...editItem, [f.key]: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                                {itemError && <div style={{ color: "#FF3008", fontSize: "0.8rem", marginTop: "8px" }}>{itemError}</div>}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                  <button onClick={handleUpdateItem} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{saving ? "Saving..." : "Update"}</button>
                                  <button onClick={() => { setEditItem(null); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{"Cancel"}</button>
                                </div>
                              </div>
                            )}

                            {sectionItems(section.id).length === 0 ? (
                              <div style={{ textAlign: "center", padding: "20px", color: "#444", fontSize: "0.85rem" }}>{"No items yet."}</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                                {sectionItems(section.id).map((item) => (
                                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</div>
                                      {item.desc && <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "2px" }}>{item.desc}</div>}
                                      <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FF3008", marginTop: "3px" }}>{"₹" + item.price}</div>
                                    </div>
                                    {item.tag && <span style={{ background: "rgba(255,48,8,0.1)", color: "#FF3008", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>{item.tag}</span>}
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button onClick={() => { setEditItem({ ...item }); setShowAddItem(false); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", color: "#888", fontFamily: "sans-serif" }}>{"Edit"}</button>
                                      <button onClick={() => handleDeleteItem(item.id)} style={{ background: "rgba(255,48,8,0.1)", border: "none", color: "#FF3008", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", fontFamily: "sans-serif" }}>{"Del"}</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!showAddItem && !editItem && (
                              <button onClick={() => { setShowAddItem(true); setNewItem({ name: "", price: "", desc: "", tag: "", sectionId: section.id }); setEditItem(null); setItemError(""); }}
                                style={{ background: "rgba(255,48,8,0.1)", color: "#FF3008", border: "1px dashed rgba(255,48,8,0.3)", padding: "9px 16px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", width: "100%", transition: "all 0.2s" }}>
                                {"+ Add Item to " + section.name}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {unsectionedItems.length > 0 && (
                  <div style={{ background: "#161616", borderRadius: "14px", padding: "18px", marginTop: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: 600 }}>{"Uncategorized"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {unsectionedItems.map((item) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FF3008", marginTop: "3px" }}>{"₹" + item.price}</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setEditItem({ ...item })} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", color: "#888", fontFamily: "sans-serif" }}>{"Edit"}</button>
                            <button onClick={() => handleDeleteItem(item.id)} style={{ background: "rgba(255,48,8,0.1)", border: "none", color: "#FF3008", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", fontFamily: "sans-serif" }}>{"Del"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {tab === "settings" && (
              <div className="fade-in" style={{ maxWidth: "540px" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"Settings"}</h2>
                  <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{"Manage your restaurant profile"}</p>
                </div>
                <div style={{ background: "#161616", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Restaurant Name"}</label>
                    <input style={inputStyle} value={settingName} onChange={(e) => setSettingName(e.target.value)} placeholder="Restaurant name" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Number of Tables"}</label>
                    <input style={inputStyle} type="number" value={settingTables} onChange={(e) => setSettingTables(e.target.value)} min="1" max="50" />
                  </div>
                  <button onClick={handleSaveSettings} style={{ background: settingSaved ? "rgba(74,222,128,0.15)" : "#FF3008", color: settingSaved ? "#4ADE80" : "#fff", border: settingSaved ? "1px solid rgba(74,222,128,0.3)" : "none", padding: "13px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", fontFamily: "sans-serif", transition: "all 0.3s" }}>
                    {settingSaved ? "✓ Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* QR CODES TAB */}
            {tab === "qrcodes" && (
              <div className="fade-in">
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"QR Code Links"}</h2>
                  <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{"Share these links or print QR codes for each table"}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {Array.from({ length: Number(restaurant.tableCount) }, (_, i) => i + 1).map((t) => {
                    const url = typeof window !== "undefined" ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=" + t : "";
                    return (
                      <div key={t} style={{ background: "#161616", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ background: "#FF3008", color: "#fff", width: "36px", height: "36px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>{t}</div>
                        <div style={{ flex: 1, fontSize: "0.75rem", color: "#555", wordBreak: "break-all", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
                        <button onClick={() => { navigator.clipboard.writeText(url); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.75rem", color: "#888", fontFamily: "sans-serif", flexShrink: 0 }}>{"Copy"}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
