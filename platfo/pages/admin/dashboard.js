import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const STATUS_FLOW = ["New", "Preparing", "Ready", "Delivered"];
const STATUS_COLOR = {
  New:       { bg: "rgba(255,193,7,0.1)", text: "#FFC107", dot: "#FFC107", border: "rgba(255,193,7,0.2)" },
  Preparing: { bg: "rgba(99,102,241,0.1)", text: "#818CF8", dot: "#818CF8", border: "rgba(99,102,241,0.2)" },
  Ready:     { bg: "rgba(16,185,129,0.1)", text: "#10B981", dot: "#10B981", border: "rgba(16,185,129,0.2)" },
  Delivered: { bg: "rgba(107,114,128,0.1)", text: "#6B7280", dot: "#6B7280", border: "rgba(107,114,128,0.2)" },
};

function getISTDate(offsetDays) {
  const now = new Date();
  const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  istDate.setDate(istDate.getDate() + offsetDays);
  return istDate.toISOString().split("T")[0];
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editSection, setEditSection] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", desc: "", tag: "", sectionId: "" });
  const [editItem, setEditItem] = useState(null);
  const [itemError, setItemError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => { if (restaurantId) fetchOrders("", ""); }, [restaurantId]);

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
      const now = new Date(); const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const first = new Date(ist.getFullYear(), ist.getMonth(), 1).toISOString().split("T")[0];
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed."); }
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

  const logout = () => { localStorage.removeItem("restaurant"); localStorage.removeItem("token"); router.push("/admin"); };

  if (!restaurant) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #FF3008", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "#555" }}>{"Loading..."}</p>
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

  const inp = { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "#1A1A1A", color: "#fff", fontSize: "0.9rem", outline: "none", fontFamily: "sans-serif", boxSizing: "border-box", marginTop: "4px" };

  const navItems = [
    { key: "orders", icon: "◈", label: "Orders" },
    { key: "menu", icon: "◉", label: "Menu" },
    { key: "settings", icon: "◎", label: "Settings" },
    { key: "qrcodes", icon: "⊞", label: "QR Codes" },
  ];

  return (
    <>
      <Head>
        <title>{restaurant.name + " — Platfo"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #0A0A0A; color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .dashboard { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          background: #111;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 240px;
          z-index: 50;
          transition: transform 0.3s;
        }

        .sidebar-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          padding: 8px 12px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 16px;
        }

        .sidebar-brand span { color: #FF3008; }

        .restaurant-info {
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .restaurant-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .restaurant-id {
          font-size: 0.72rem;
          color: #444;
          margin-top: 2px;
        }

        .nav-section-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #333;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          color: #555;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 2px;
        }

        .nav-item:hover { background: rgba(255,255,255,0.04); color: #888; }
        .nav-item.active { background: rgba(255,48,8,0.1); color: #FF3008; }
        .nav-item.active .nav-icon { color: #FF3008; }

        .nav-icon { font-size: 1rem; width: 20px; text-align: center; }

        .sidebar-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.82rem;
          color: #444;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        .sidebar-link:hover { background: rgba(255,255,255,0.04); color: #888; }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.82rem;
          color: #444;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .logout-btn:hover { background: rgba(255,48,8,0.08); color: #FF3008; }

        /* MAIN */
        .main { margin-left: 240px; min-height: 100vh; }

        /* TOP BAR */
        .topbar {
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0A0A0A;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .topbar-actions { display: flex; gap: 10px; align-items: center; }

        .topbar-btn {
          padding: 9px 18px;
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #888;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .topbar-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .topbar-btn.primary { background: #FF3008; color: #fff; border-color: #FF3008; }
        .topbar-btn.primary:hover { background: #CC2000; }

        /* CONTENT */
        .content { padding: 32px; }

        /* STAT CARDS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 20px 24px;
          transition: all 0.2s;
          animation: fadeIn 0.4s ease both;
        }

        .stat-card:hover { border-color: rgba(255,48,8,0.2); transform: translateY(-2px); }

        .stat-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #444;
          margin-bottom: 10px;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
        }

        .stat-value.red { color: #FF3008; }

        .stat-change {
          font-size: 0.75rem;
          color: #333;
          margin-top: 6px;
        }

        /* FILTER BAR */
        .filter-bar {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 20px;
        }

        .filter-bar-title {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #444;
          margin-bottom: 14px;
        }

        .date-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .date-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #555;
          transition: all 0.2s;
        }

        .date-btn:hover { color: #888; border-color: rgba(255,255,255,0.1); }
        .date-btn.active { background: rgba(255,48,8,0.1); color: #FF3008; border-color: rgba(255,48,8,0.3); }

        .date-inputs {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .date-input-group label {
          display: block;
          font-size: 0.72rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .date-input {
          padding: 10px 14px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }

        .search-btn {
          padding: 10px 20px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .search-btn:hover { background: #CC2000; }

        /* STATUS TABS */
        .status-tabs {
          display: flex;
          gap: 4px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 6px;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .status-tab {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
          color: #555;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-tab:hover { color: #888; }
        .status-tab.active { background: rgba(255,48,8,0.1); color: #FF3008; }

        .status-count {
          background: #FF3008;
          color: #fff;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 700;
        }

        /* ORDER CARDS */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .order-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeIn 0.3s ease both;
          transition: border-color 0.2s;
        }

        .order-card:hover { border-color: rgba(255,48,8,0.15); }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .order-id {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .order-time { font-size: 0.72rem; color: #444; margin-top: 3px; }
        .order-customer { font-size: 0.78rem; color: #555; margin-top: 3px; }

        .table-badge {
          background: rgba(255,255,255,0.06);
          color: #888;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .order-items {
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #666;
        }

        .order-item-price { font-weight: 600; color: #888; }

        .order-bill {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 12px 14px;
        }

        .bill-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: #444;
          margin-bottom: 6px;
        }

        .bill-total {
          display: flex;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 2px;
        }

        .bill-total-label { font-weight: 600; color: #888; font-size: 0.85rem; }
        .bill-total-value { font-family: 'Syne', sans-serif; font-weight: 800; color: #FF3008; font-size: 1rem; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-label { font-size: 0.72rem; color: #333; text-transform: uppercase; letter-spacing: 1px; }

        .action-btns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .action-btn {
          padding: 8px 4px;
          border-radius: 8px;
          font-size: 0.68rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #555;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          text-align: center;
        }

        .action-btn:hover { color: #888; }
        .action-btn.active-status { border-color: #FF3008; background: rgba(255,48,8,0.1); color: #FF3008; }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .next-btn {
          width: 100%;
          padding: 12px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .next-btn:hover { background: #CC2000; }
        .next-btn:disabled { background: #333; cursor: not-allowed; }

        .print-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          color: #555;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .print-btn:hover { background: rgba(255,255,255,0.07); color: #888; }

        /* EMPTY STATE */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #333;
        }

        .empty-icon { font-size: 3rem; margin-bottom: 16px; }
        .empty-title { font-size: 1rem; font-weight: 600; color: #444; margin-bottom: 8px; }
        .empty-desc { font-size: 0.85rem; color: #333; }

        /* MENU */
        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
        }

        .add-btn {
          padding: 10px 20px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .add-btn:hover { background: #CC2000; }

        .form-card {
          background: #111;
          border: 1px solid rgba(255,48,8,0.2);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 16px;
          animation: fadeIn 0.2s ease;
        }

        .form-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-field label {
          display: block;
          font-size: 0.72rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .form-btns {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .save-btn {
          padding: 10px 20px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .save-btn:disabled { background: #333; cursor: not-allowed; }

        .cancel-btn {
          padding: 10px 20px;
          background: rgba(255,255,255,0.04);
          color: #555;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .section-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .section-card.open { border-color: rgba(255,48,8,0.2); }

        .section-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .section-header:hover { background: rgba(255,255,255,0.02); }
        .section-card.open .section-header { background: rgba(255,48,8,0.04); }

        .section-left { display: flex; align-items: center; gap: 12px; }

        .section-dot {
          width: 6px; height: 6px;
          background: #FF3008;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255,48,8,0.5);
        }

        .section-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: #fff;
        }

        .section-count {
          background: rgba(255,255,255,0.06);
          color: #555;
          font-size: 0.68rem;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .section-actions { display: flex; gap: 6px; align-items: center; }

        .icon-btn {
          padding: 6px 12px;
          border-radius: 7px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #555;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .icon-btn:hover { color: #888; }
        .icon-btn.danger:hover { background: rgba(255,48,8,0.08); color: #FF3008; border-color: rgba(255,48,8,0.2); }

        .chevron { color: #333; font-size: 0.8rem; transition: transform 0.2s; }
        .section-card.open .chevron { transform: rotate(180deg); }

        .section-body { padding: 0 20px 20px; }

        .item-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .item-card:hover { border-color: rgba(255,255,255,0.08); }

        .item-info { flex: 1; }
        .item-name { font-weight: 600; font-size: 0.88rem; color: #ddd; }
        .item-desc { font-size: 0.72rem; color: #444; margin-top: 2px; }
        .item-price { font-weight: 700; color: #FF3008; font-size: 0.88rem; margin-top: 4px; }
        .item-tag { background: rgba(255,48,8,0.1); color: #FF3008; font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 5px; border: 1px solid rgba(255,48,8,0.2); }
        .item-btns { display: flex; gap: 6px; }

        .add-item-btn {
          padding: 10px 16px;
          background: rgba(255,255,255,0.04);
          color: #555;
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
          margin-top: 4px;
        }

        .add-item-btn:hover { background: rgba(255,48,8,0.06); color: #FF3008; border-color: rgba(255,48,8,0.2); }

        /* QR */
        .qr-list { display: flex; flex-direction: column; gap: 10px; }

        .qr-item {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s;
        }

        .qr-item:hover { border-color: rgba(255,255,255,0.1); }

        .qr-num {
          width: 36px; height: 36px;
          background: rgba(255,48,8,0.1);
          border: 1px solid rgba(255,48,8,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: #FF3008;
          flex-shrink: 0;
        }

        .qr-url { flex: 1; font-size: 0.78rem; color: #444; word-break: break-all; }

        .copy-btn {
          padding: 7px 14px;
          background: rgba(255,255,255,0.04);
          color: #555;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .copy-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* SETTINGS */
        .settings-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 28px;
          max-width: 480px;
        }

        .settings-field { margin-bottom: 20px; }

        .settings-field label {
          display: block;
          font-size: 0.72rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .save-settings-btn {
          width: 100%;
          padding: 14px;
          background: #FF3008;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .save-settings-btn:hover { background: #CC2000; }

        /* MOBILE */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 16px; left: 16px;
          z-index: 60;
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 12px;
          color: #fff;
          cursor: pointer;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .dashboard { grid-template-columns: 1fr; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main { margin-left: 0; }
          .mobile-menu-btn { display: block; }
          .topbar { padding: 16px 20px 16px 60px; }
          .content { padding: 20px 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .orders-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      <div className="dashboard">

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">Plat<span>fo</span></div>

          <div className="restaurant-info">
            <div className="restaurant-name">{restaurant.name}</div>
            <div className="restaurant-id">{restaurantId}</div>
          </div>

          <div className="nav-section-label">{"Navigation"}</div>

          {navItems.map((item) => (
            <button key={item.key} className={`nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => { setTab(item.key); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.key === "orders" && counts["New"] > 0 && (
                <span style={{ marginLeft: "auto", background: "#FF3008", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "5px", fontWeight: 700 }}>{counts["New"]}</span>
              )}
            </button>
          ))}

          <div className="sidebar-bottom">
            <a href={menuUrl} target="_blank" rel="noreferrer" className="sidebar-link">
              {"⊕ View Menu"}
            </a>
            <a href={"/kitchen/" + restaurantId} target="_blank" rel="noreferrer" className="sidebar-link">
              {"⊗ Kitchen Display"}
            </a>
            <a href="/admin/tables" className="sidebar-link">
              {"⊞ Table History"}
            </a>
            <button className="logout-btn" onClick={logout}>
              {"⊘ Logout"}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">

          {/* TOP BAR */}
          <div className="topbar">
            <div className="topbar-title">
              {tab === "orders" && "Orders"}
              {tab === "menu" && "Menu Management"}
              {tab === "settings" && "Settings"}
              {tab === "qrcodes" && "QR Codes"}
            </div>
            <div className="topbar-actions">
              <a href={menuUrl} target="_blank" rel="noreferrer" className="topbar-btn primary">
                {"View Menu →"}
              </a>
            </div>
          </div>

          <div className="content">

            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div>
                {/* Stats */}
                <div className="stats-grid">
                  {[
                    { label: "Total Orders", value: orders.length, red: false },
                    { label: "New Orders", value: counts["New"] || 0, red: true },
                    { label: "Pending", value: orders.filter((o) => o.status !== "Delivered").length, red: false },
                    { label: "Revenue", value: "₹" + totalRevenue, red: true },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ animationDelay: i * 0.05 + "s" }}>
                      <div className="stat-label">{s.label}</div>
                      <div className={`stat-value ${s.red ? "red" : ""}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <div className="filter-bar">
                  <div className="filter-bar-title">{"Filter by Date"}</div>
                  <div className="date-btns">
                    {[{ key: "all", label: "All Time" }, { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" }, { key: "week", label: "Last 7 Days" }, { key: "month", label: "This Month" }].map((b) => (
                      <button key={b.key} className={`date-btn ${activeDateBtn === b.key ? "active" : ""}`} onClick={() => handleDateBtn(b.key)}>{b.label}</button>
                    ))}
                  </div>
                  <div className="date-inputs">
                    <div className="date-input-group">
                      <label>{"From"}</label>
                      <input className="date-input" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveDateBtn("custom"); }} />
                    </div>
                    <div className="date-input-group">
                      <label>{"To"}</label>
                      <input className="date-input" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveDateBtn("custom"); }} />
                    </div>
                    <button className="search-btn" onClick={() => fetchOrders(startDate, endDate)}>{"Search"}</button>
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="status-tabs">
                  {statusTabs.map((t) => (
                    <button key={t} className={`status-tab ${statusFilter === t ? "active" : ""}`} onClick={() => setStatusFilter(t)}>
                      {t}
                      {t !== "All" && counts[t] > 0 && <span className="status-count">{counts[t]}</span>}
                    </button>
                  ))}
                </div>

                {/* Orders */}
                {loadingOrders ? (
                  <div className="empty-state">
                    <div style={{ width: "32px", height: "32px", border: "2px solid #FF3008", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
                    <p style={{ color: "#444" }}>{"Loading orders..."}</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">{"◈"}</div>
                    <div className="empty-title">{"No orders found"}</div>
                    <div className="empty-desc">{"Try selecting a different date range"}</div>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {filteredOrders.map((order, idx) => {
                      const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                      const isUpdating = updatingId === order.id;
                      const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                      const gst = order.gst || Math.round(subtotal * 0.18);
                      const total = order.total || subtotal + gst;
                      return (
                        <div key={order.id} className="order-card" style={{ animationDelay: idx * 0.03 + "s" }}>
                          <div className="order-header">
                            <div>
                              <div className="order-id">{order.id}</div>
                              <div className="order-time">{formatDate(order.timestamp) + " · " + formatTime(order.timestamp)}</div>
                              {order.customerName && <div className="order-customer">{order.customerName + " · " + order.customerPhone}</div>}
                            </div>
                            <div className="table-badge">{"T" + order.tableNumber}</div>
                          </div>

                          <div className="order-items">
                            {order.items.map((item, i) => (
                              <div key={i} className="order-item-row">
                                <span>{item.name + " × " + item.qty}</span>
                                <span className="order-item-price">{"₹" + item.price * item.qty}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-bill">
                            <div className="bill-row"><span>{"Subtotal"}</span><span>{"₹" + subtotal}</span></div>
                            <div className="bill-row"><span>{"GST (18%)"}</span><span style={{ color: "#FF3008" }}>{"+ ₹" + gst}</span></div>
                            <div className="bill-total">
                              <span className="bill-total-label">{"Total"}</span>
                              <span className="bill-total-value">{"₹" + total}</span>
                            </div>
                          </div>

                          <div className="status-row">
                            <span className="status-label">{"Status"}</span>
                            <span className="status-badge" style={{ background: sc.bg, color: sc.text, border: "1px solid " + sc.border }}>
                              <span className="status-dot" style={{ background: sc.dot }}></span>
                              {order.status}
                            </span>
                          </div>

                          <div className="action-btns">
                            {STATUS_FLOW.map((s) => (
                              <button key={s} className={`action-btn ${order.status === s ? "active-status" : ""}`}
                                onClick={() => updateStatus(order.id, s)}
                                disabled={isUpdating || order.status === s}>
                                {s}
                              </button>
                            ))}
                          </div>

                          {nextStatus && (
                            <button className="next-btn" onClick={() => updateStatus(order.id, nextStatus)} disabled={isUpdating}>
                              {isUpdating ? "Updating..." : "Mark " + nextStatus + " →"}
                            </button>
                          )}

                          <button className="print-btn" onClick={() => window.open("/receipt/" + order.id + "?restaurantId=" + restaurantId, "_blank")}>
                            {"Print Receipt"}
                          </button>
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
                <div className="menu-header">
                  <div className="page-title">{"Menu Sections"}</div>
                  <button className="add-btn" onClick={() => { setShowAddSection(true); setNewSectionName(""); }}>{"+ Add Section"}</button>
                </div>

                {showAddSection && (
                  <div className="form-card">
                    <div className="form-card-title">{"New Section"}</div>
                    <input style={inp} placeholder="e.g. Starters, Main Course, Beverages" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddSection()} />
                    <div className="form-btns">
                      <button className="save-btn" onClick={handleAddSection} disabled={saving}>{saving ? "Creating..." : "Create Section"}</button>
                      <button className="cancel-btn" onClick={() => setShowAddSection(false)}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {editSection && (
                  <div className="form-card">
                    <div className="form-card-title">{"Edit Section"}</div>
                    <input style={inp} value={editSection.name} onChange={(e) => setEditSection({ ...editSection, name: e.target.value })} />
                    <div className="form-btns">
                      <button className="save-btn" onClick={handleUpdateSection} disabled={saving}>{saving ? "Saving..." : "Update Section"}</button>
                      <button className="cancel-btn" onClick={() => setEditSection(null)}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {sections.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">{"◉"}</div>
                    <div className="empty-title">{"No sections yet"}</div>
                    <div className="empty-desc">{"Click Add Section to get started"}</div>
                  </div>
                )}

                {sections.map((section) => (
                  <div key={section.id} className={`section-card ${activeSectionId === section.id ? "open" : ""}`}>
                    <div className="section-header" onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}>
                      <div className="section-left">
                        <div className="section-dot"></div>
                        <span className="section-name">{section.name}</span>
                        <span className="section-count">{sectionItems(section.id).length + " items"}</span>
                      </div>
                      <div className="section-actions">
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditSection({ ...section }); setShowAddSection(false); }}>{"Edit"}</button>
                        <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}>{"Delete"}</button>
                        <span className="chevron">{"▼"}</span>
                      </div>
                    </div>

                    {activeSectionId === section.id && (
                      <div className="section-body">
                        {showAddItem && (
                          <div className="form-card" style={{ marginBottom: "12px" }}>
                            <div className="form-card-title">{"Add Item to " + section.name}</div>
                            <div className="form-grid">
                              <div className="form-field">
                                <label>{"Item Name *"}</label>
                                <input style={inp} placeholder="e.g. Paneer Tikka" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Price (₹) *"}</label>
                                <input style={inp} type="number" placeholder="150" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Description"}</label>
                                <input style={inp} placeholder="Short description" value={newItem.desc} onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Tag"}</label>
                                <input style={inp} placeholder="e.g. Bestseller" value={newItem.tag} onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })} />
                              </div>
                            </div>
                            {itemError && <div style={{ color: "#FF6B6B", fontSize: "0.8rem", marginTop: "10px" }}>{itemError}</div>}
                            <div className="form-btns">
                              <button className="save-btn" onClick={handleAddItem} disabled={saving}>{saving ? "Adding..." : "Add Item"}</button>
                              <button className="cancel-btn" onClick={() => { setShowAddItem(false); setItemError(""); }}>{"Cancel"}</button>
                            </div>
                          </div>
                        )}

                        {editItem && editItem.sectionId === section.id && (
                          <div className="form-card" style={{ marginBottom: "12px" }}>
                            <div className="form-card-title">{"Edit Item"}</div>
                            <div className="form-grid">
                              <div className="form-field">
                                <label>{"Item Name *"}</label>
                                <input style={inp} value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Price (₹) *"}</label>
                                <input style={inp} type="number" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Description"}</label>
                                <input style={inp} value={editItem.desc || ""} onChange={(e) => setEditItem({ ...editItem, desc: e.target.value })} />
                              </div>
                              <div className="form-field">
                                <label>{"Tag"}</label>
                                <input style={inp} value={editItem.tag || ""} onChange={(e) => setEditItem({ ...editItem, tag: e.target.value })} />
                              </div>
                            </div>
                            {itemError && <div style={{ color: "#FF6B6B", fontSize: "0.8rem", marginTop: "10px" }}>{itemError}</div>}
                            <div className="form-btns">
                              <button className="save-btn" onClick={handleUpdateItem} disabled={saving}>{saving ? "Saving..." : "Update Item"}</button>
                              <button className="cancel-btn" onClick={() => { setEditItem(null); setItemError(""); }}>{"Cancel"}</button>
                            </div>
                          </div>
                        )}

                        {sectionItems(section.id).length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px", color: "#333", fontSize: "0.85rem" }}>{"No items yet"}</div>
                        ) : (
                          sectionItems(section.id).map((item) => (
                            <div key={item.id} className="item-card">
                              <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                {item.desc && <div className="item-desc">{item.desc}</div>}
                                <div className="item-price">{"₹" + item.price}</div>
                              </div>
                              {item.tag && <span className="item-tag">{item.tag}</span>}
                              <div className="item-btns">
                                <button className="icon-btn" onClick={() => { setEditItem({ ...item }); setShowAddItem(false); setItemError(""); }}>{"Edit"}</button>
                                <button className="icon-btn danger" onClick={() => handleDeleteItem(item.id)}>{"Del"}</button>
                              </div>
                            </div>
                          ))
                        )}

                        {!showAddItem && !editItem && (
                          <button className="add-item-btn" onClick={() => { setShowAddItem(true); setNewItem({ name: "", price: "", desc: "", tag: "", sectionId: section.id }); setEditItem(null); setItemError(""); }}>
                            {"+ Add Item to " + section.name}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {unsectionedItems.length > 0 && (
                  <div className="section-card" style={{ marginTop: "16px" }}>
                    <div className="section-header" onClick={() => setActiveSectionId(activeSectionId === "other" ? null : "other")}>
                      <div className="section-left">
                        <div className="section-dot" style={{ background: "#444" }}></div>
                        <span className="section-name" style={{ color: "#666" }}>{"Uncategorized"}</span>
                        <span className="section-count">{unsectionedItems.length + " items"}</span>
                      </div>
                      <span className="chevron">{"▼"}</span>
                    </div>
                    {activeSectionId === "other" && (
                      <div className="section-body">
                        {unsectionedItems.map((item) => (
                          <div key={item.id} className="item-card">
                            <div className="item-info">
                              <div className="item-name">{item.name}</div>
                              <div className="item-price">{"₹" + item.price}</div>
                            </div>
                            <div className="item-btns">
                              <button className="icon-btn" onClick={() => setEditItem({ ...item })}>{"Edit"}</button>
                              <button className="icon-btn danger" onClick={() => handleDeleteItem(item.id)}>{"Del"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {tab === "settings" && (
              <div>
                <div className="page-title" style={{ marginBottom: "20px" }}>{"Restaurant Settings"}</div>
                <div className="settings-card">
                  <div className="settings-field">
                    <label>{"Restaurant Name"}</label>
                    <input style={inp} value={settingName} onChange={(e) => setSettingName(e.target.value)} placeholder="Restaurant name" />
                  </div>
                  <div className="settings-field">
                    <label>{"Number of Tables"}</label>
                    <input style={inp} type="number" value={settingTables} onChange={(e) => setSettingTables(e.target.value)} min="1" max="50" />
                  </div>
                  <button className="save-settings-btn" onClick={handleSaveSettings}>
                    {settingSaved ? "✓ Saved!" : "Save Settings"}
                  </button>
                </div>
              </div>
            )}

            {/* QR CODES TAB */}
            {tab === "qrcodes" && (
              <div>
                <div className="page-title" style={{ marginBottom: "8px" }}>{"QR Code Links"}</div>
                <p style={{ color: "#444", fontSize: "0.85rem", marginBottom: "20px" }}>{"Copy these links or generate QR codes for each table."}</p>
                <div className="qr-list">
                  {Array.from({ length: Number(restaurant.tableCount) }, (_, i) => i + 1).map((t) => {
                    const url = typeof window !== "undefined" ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=" + t : "";
                    return (
                      <div key={t} className="qr-item">
                        <div className="qr-num">{t}</div>
                        <div className="qr-url">{url}</div>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(url)}>{"Copy"}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
