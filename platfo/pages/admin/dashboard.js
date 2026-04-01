import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const STATUS_FLOW = ["New", "Preparing", "Ready", "Delivered"];
const STATUS_COLOR = {
  New:       { bg: "rgba(255,193,7,0.15)", text: "#FFC107", dot: "#FFC107" },
  Preparing: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", dot: "#818CF8" },
  Ready:     { bg: "rgba(34,197,94,0.15)", text: "#4ADE80", dot: "#4ADE80" },
  Delivered: { bg: "rgba(148,163,184,0.15)", text: "#94A3B8", dot: "#94A3B8" },
};

const COUNTRIES = [
  { country: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", taxName: "GST", taxRate: 18, timezone: "Asia/Kolkata" },
  { country: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", taxName: "Tax", taxRate: 8, timezone: "America/New_York" },
  { country: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", taxName: "VAT", taxRate: 20, timezone: "Europe/London" },
  { country: "United Arab Emirates", flag: "🇦🇪", currency: "AED", symbol: "د.إ", taxName: "VAT", taxRate: 5, timezone: "Asia/Dubai" },
  { country: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "ر.س", taxName: "VAT", taxRate: 15, timezone: "Asia/Riyadh" },
  { country: "Singapore", flag: "🇸🇬", currency: "SGD", symbol: "S$", taxName: "GST", taxRate: 9, timezone: "Asia/Singapore" },
  { country: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$", taxName: "GST", taxRate: 10, timezone: "Australia/Sydney" },
  { country: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$", taxName: "GST", taxRate: 5, timezone: "America/Toronto" },
  { country: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€", taxName: "VAT", taxRate: 19, timezone: "Europe/Berlin" },
  { country: "France", flag: "🇫🇷", currency: "EUR", symbol: "€", taxName: "VAT", taxRate: 20, timezone: "Europe/Paris" },
  { country: "Netherlands", flag: "🇳🇱", currency: "EUR", symbol: "€", taxName: "VAT", taxRate: 21, timezone: "Europe/Amsterdam" },
  { country: "Nepal", flag: "🇳🇵", currency: "NPR", symbol: "Rs", taxName: "VAT", taxRate: 13, timezone: "Asia/Kathmandu" },
  { country: "Bangladesh", flag: "🇧🇩", currency: "BDT", symbol: "৳", taxName: "VAT", taxRate: 15, timezone: "Asia/Dhaka" },
  { country: "Sri Lanka", flag: "🇱🇰", currency: "LKR", symbol: "₨", taxName: "VAT", taxRate: 15, timezone: "Asia/Colombo" },
  { country: "Malaysia", flag: "🇲🇾", currency: "MYR", symbol: "RM", taxName: "SST", taxRate: 6, timezone: "Asia/Kuala_Lumpur" },
  { country: "South Africa", flag: "🇿🇦", currency: "ZAR", symbol: "R", taxName: "VAT", taxRate: 15, timezone: "Africa/Johannesburg" },
  { country: "Nigeria", flag: "🇳🇬", currency: "NGN", symbol: "₦", taxName: "VAT", taxRate: 7.5, timezone: "Africa/Lagos" },
  { country: "Kenya", flag: "🇰🇪", currency: "KES", symbol: "KSh", taxName: "VAT", taxRate: 16, timezone: "Africa/Nairobi" },
  { country: "Japan", flag: "🇯🇵", currency: "JPY", symbol: "¥", taxName: "Tax", taxRate: 10, timezone: "Asia/Tokyo" },
  { country: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "NZ$", taxName: "GST", taxRate: 15, timezone: "Pacific/Auckland" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "🇮🇳 India (IST +5:30)" },
  { value: "America/New_York", label: "🇺🇸 New York (EST -5:00)" },
  { value: "America/Los_Angeles", label: "🇺🇸 Los Angeles (PST -8:00)" },
  { value: "America/Chicago", label: "🇺🇸 Chicago (CST -6:00)" },
  { value: "Europe/London", label: "🇬🇧 London (GMT 0:00)" },
  { value: "Europe/Paris", label: "🇫🇷 Paris (CET +1:00)" },
  { value: "Europe/Berlin", label: "🇩🇪 Berlin (CET +1:00)" },
  { value: "Europe/Amsterdam", label: "🇳🇱 Amsterdam (CET +1:00)" },
  { value: "Asia/Dubai", label: "🇦🇪 Dubai (GST +4:00)" },
  { value: "Asia/Riyadh", label: "🇸🇦 Riyadh (AST +3:00)" },
  { value: "Asia/Singapore", label: "🇸🇬 Singapore (SGT +8:00)" },
  { value: "Asia/Tokyo", label: "🇯🇵 Tokyo (JST +9:00)" },
  { value: "Asia/Kuala_Lumpur", label: "🇲🇾 Kuala Lumpur (MYT +8:00)" },
  { value: "Asia/Dhaka", label: "🇧🇩 Dhaka (BST +6:00)" },
  { value: "Asia/Kathmandu", label: "🇳🇵 Kathmandu (NPT +5:45)" },
  { value: "Asia/Colombo", label: "🇱🇰 Colombo (SLST +5:30)" },
  { value: "Australia/Sydney", label: "🇦🇺 Sydney (AEST +10:00)" },
  { value: "Pacific/Auckland", label: "🇳🇿 Auckland (NZST +12:00)" },
  { value: "Africa/Lagos", label: "🇳🇬 Lagos (WAT +1:00)" },
  { value: "Africa/Nairobi", label: "🇰🇪 Nairobi (EAT +3:00)" },
  { value: "Africa/Johannesburg", label: "🇿🇦 Johannesburg (SAST +2:00)" },
  { value: "America/Toronto", label: "🇨🇦 Toronto (EST -5:00)" },
];

function getDateByTimezone(offsetDays, timezone) {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone || "Asia/Kolkata" }));
  tzDate.setDate(tzDate.getDate() + offsetDays);
  return tzDate.toISOString().split("T")[0];
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
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Localization
  const [currency, setCurrency] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [country, setCountry] = useState("India");
  const [taxName, setTaxName] = useState("GST");
  const [taxRate, setTaxRate] = useState(18);
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Payment
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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
    setCurrency(r.currency || "INR");
    setCurrencySymbol(r.currencySymbol || "₹");
    setCountry(r.country || "India");
    setTaxName(r.taxName || "GST");
    setTaxRate(r.taxRate ?? 18);
    setTimezone(r.timezone || "Asia/Kolkata");
    setRazorpayKeyId(r.razorpayKeyId || "");
    setRazorpayKeySecret(r.razorpayKeySecret || "");
  }, [router]);

  const fetchOrders = useCallback(async (sDate, eDate, silent = false) => {
    if (!restaurantId) return;
    if (!silent) setLoadingOrders(true);
    try {
      let url = "/api/order?restaurantId=" + restaurantId;
      if (sDate) url += "&startDate=" + sDate;
      if (eDate) url += "&endDate=" + eDate;
      const res = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
      const data = await res.json();
      const newOrders = data.orders || [];
      setLastUpdated(new Date());
      if (silent) {
        setOrders((prev) => {
          const prevIds = new Set(prev.map((o) => o.id));
          const brandNew = newOrders.filter((o) => !prevIds.has(o.id));
          if (brandNew.length > 0) {
            setNewOrderAlert(true);
            setTimeout(() => setNewOrderAlert(false), 5000);
            return [...brandNew, ...prev];
          }
          return prev.map((prevOrder) => {
            const updated = newOrders.find((o) => o.id === prevOrder.id);
            if (updated && updated.status !== prevOrder.status) return { ...prevOrder, status: updated.status };
            return prevOrder;
          });
        });
      } else {
        setOrders(newOrders);
      }
    } catch (err) { console.log("Fetch error:", err); }
    finally { if (!silent) setLoadingOrders(false); }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders("", "");
      const interval = setInterval(() => {
        fetchOrders(startDate, endDate, true);
      }, 5000);
      return () => clearInterval(interval);
    }
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
    const tz = timezone || "Asia/Kolkata";
    if (type === "today") { const d = getDateByTimezone(0, tz); setStartDate(d); setEndDate(d); fetchOrders(d, d); }
    else if (type === "yesterday") { const d = getDateByTimezone(-1, tz); setStartDate(d); setEndDate(d); fetchOrders(d, d); }
    else if (type === "week") { const s = getDateByTimezone(-7, tz); const e = getDateByTimezone(0, tz); setStartDate(s); setEndDate(e); fetchOrders(s, e); }
    else if (type === "month") {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const today = getDateByTimezone(0, tz); setStartDate(first); setEndDate(today); fetchOrders(first, today);
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

  const handleSaveLocalization = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ id: restaurantId, currency, currencySymbol, country, taxName, taxRate: Number(taxRate), timezone }),
      });
      if (res.ok) {
        const stored = JSON.parse(localStorage.getItem("restaurant"));
        stored.currency = currency; stored.currencySymbol = currencySymbol;
        stored.country = country; stored.taxName = taxName;
        stored.taxRate = Number(taxRate); stored.timezone = timezone;
        localStorage.setItem("restaurant", JSON.stringify(stored));
        setRestaurant(stored); setSettingSaved(true);
        setTimeout(() => setSettingSaved(false), 2000);
      }
    } catch {}
    finally { setSaving(false); }
  };

  const handleSavePayment = async () => {
    setSavingPayment(true); setPaymentError(""); setPaymentSaved(false);
    try {
      const res = await fetch("/api/restaurant?action=updatePayment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ restaurantId, razorpayKeyId, razorpayKeySecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      const stored = JSON.parse(localStorage.getItem("restaurant"));
      stored.razorpayKeyId = razorpayKeyId;
      localStorage.setItem("restaurant", JSON.stringify(stored));
      setRestaurant(stored); setPaymentSaved(true);
      setTimeout(() => setPaymentSaved(false), 4000);
    } catch (err) { setPaymentError(err.message); }
    finally { setSavingPayment(false); }
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
        <p style={{ color: "#555" }}>{"Loading..."}</p>
      </div>
    </div>
  );

  const sym = restaurant.currencySymbol || "₹";
  const tRate = restaurant.taxRate ?? 18;
  const tName = restaurant.taxName || "GST";

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
        select { color: #fff; }
        select option { background: #161616; color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
        @media (max-width: 768px) { .sidebar { display: none !important; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0F0F0F" }}>

        {/* SIDEBAR */}
        <div className="sidebar" style={{ width: sidebarOpen ? "240px" : "70px", background: "#161616", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", transition: "width 0.3s ease", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div style={{ padding: "24px 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div style={{ width: "38px", height: "38px", background: "#FF3008", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, boxShadow: "0 0 20px rgba(255,48,8,0.4)" }}>{"🍽️"}</div>
            {sidebarOpen && (<div><div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.5px" }}>{"Platfo"}</div><div style={{ fontSize: "0.7rem", color: "#FF3008", fontWeight: 600 }}>{"Admin Panel"}</div></div>)}
          </div>
          {sidebarOpen && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{"Restaurant"}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{restaurant.name}</div>
              <div style={{ fontSize: "0.68rem", color: "#555", marginTop: "2px" }}>{(COUNTRIES.find(c => c.country === restaurant.country)?.flag || "🌍") + " " + (restaurant.country || "India") + " · " + sym}</div>
            </div>
          )}
          <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.88rem", fontWeight: 600, background: tab === item.id ? "rgba(255,48,8,0.15)" : "transparent", color: tab === item.id ? "#FF3008" : "#555", transition: "all 0.2s", textAlign: "left", width: "100%", whiteSpace: "nowrap", borderLeft: tab === item.id ? "2px solid #FF3008" : "2px solid transparent" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
                {item.id === "orders" && counts["New"] > 0 && sidebarOpen && (
                  <span style={{ marginLeft: "auto", background: "#FF3008", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>{counts["New"]}</span>
                )}
              </button>
            ))}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <a href="/admin/tables" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#555", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"📋"}</span>
              {sidebarOpen && "Table History"}
            </a>
            <a href={"/kitchen/" + restaurantId} target="_blank" rel="noreferrer" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#555", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"👨‍🍳"}</span>
              {sidebarOpen && "Kitchen Display"}
            </a>
            <a href={menuUrl} target="_blank" rel="noreferrer" className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", color: "#555", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap", borderLeft: "2px solid transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"👁️"}</span>
              {sidebarOpen && "View Menu"}
            </a>
          </div>
          <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={logout} className="nav-btn" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.88rem", fontWeight: 600, background: "transparent", color: "#555", width: "100%", textAlign: "left", whiteSpace: "nowrap", transition: "all 0.2s" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{"🚪"}</span>
              {sidebarOpen && "Logout"}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

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
              {newOrderAlert && (
                <div style={{ background: "rgba(255,48,8,0.15)", border: "1px solid rgba(255,48,8,0.3)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem", color: "#FF3008", fontWeight: 600, animation: "slideDown 0.3s ease" }}>{"🔔 New order!"}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "8px", padding: "6px 12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#4ADE80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "0.72rem", color: "#4ADE80", fontWeight: 600 }}>{"Live · 5s"}</span>
              </div>
              {lastUpdated && <div style={{ fontSize: "0.7rem", color: "#444" }}>{lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>}
              <div style={{ background: counts["New"] > 0 ? "rgba(255,48,8,0.1)" : "rgba(255,255,255,0.04)", border: counts["New"] > 0 ? "1px solid rgba(255,48,8,0.2)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem", color: counts["New"] > 0 ? "#FF3008" : "#555", fontWeight: 600 }}>
                {counts["New"] > 0 ? counts["New"] + " New 🔥" : "No New Orders"}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div className="fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                  {[
                    { label: "Total Orders", value: orders.length, icon: "📦", color: "#818CF8" },
                    { label: "New", value: counts["New"] || 0, icon: "⚡", color: "#FFC107" },
                    { label: "Pending", value: orders.filter(o => o.status !== "Delivered").length, icon: "⏳", color: "#FB923C" },
                    { label: "Revenue", value: sym + totalRevenue, icon: "💰", color: "#4ADE80" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#161616", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "3rem", opacity: 0.06 }}>{stat.icon}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{stat.label}</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#161616", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[{ key: "all", label: "All Time" }, { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" }, { key: "week", label: "7 Days" }, { key: "month", label: "Month" }].map((btn) => (
                        <button key={btn.key} onClick={() => handleDateBtn(btn.key)} style={{ padding: "7px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "sans-serif", border: activeDateBtn === btn.key ? "1px solid #FF3008" : "1px solid rgba(255,255,255,0.08)", background: activeDateBtn === btn.key ? "rgba(255,48,8,0.15)" : "transparent", color: activeDateBtn === btn.key ? "#FF3008" : "#666", transition: "all 0.2s" }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveDateBtn("custom"); }} style={{ ...inputStyle, width: "auto", marginTop: 0, padding: "7px 10px" }} />
                      <span style={{ color: "#444" }}>{"→"}</span>
                      <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveDateBtn("custom"); }} style={{ ...inputStyle, width: "auto", marginTop: 0, padding: "7px 10px" }} />
                      <button onClick={() => fetchOrders(startDate, endDate)} style={{ padding: "7px 14px", background: "#FF3008", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.8rem" }}>{"Go"}</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", flexWrap: "wrap" }}>
                    {statusTabs.map((t) => (
                      <button key={t} onClick={() => setStatusFilter(t)} style={{ padding: "6px 14px", border: "none", background: statusFilter === t ? "rgba(255,48,8,0.15)" : "transparent", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: statusFilter === t ? "#FF3008" : "#555", borderRadius: "8px", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
                        {t}
                        {t !== "All" && counts[t] > 0 && <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.65rem", padding: "1px 5px", borderRadius: "6px" }}>{counts[t]}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingOrders ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>{"Loading orders..."}</div>
                ) : filteredOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px", color: "#333", background: "#161616", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px", opacity: 0.2 }}>{"📋"}</div>
                    <p style={{ fontWeight: 600, color: "#444" }}>{"No orders found."}</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                    {filteredOrders.map((order) => {
                      const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                      const isUpdating = updatingId === order.id;
                      const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                      const tax = order.gst || Math.round(subtotal * tRate / 100);
                      const total = order.total || subtotal + tax;
                      return (
                        <div key={order.id} style={{ background: "#161616", borderRadius: "16px", padding: "18px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{order.id}</div>
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
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                              <div style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700 }}>{"T" + order.tableNumber}</div>
                              <div style={{ background: sc.bg, color: sc.text, padding: "3px 8px", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot }} />{order.status}
                              </div>
                            </div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                                <span style={{ color: "#666" }}>{item.name + " × " + item.qty}</span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{sym + item.price * item.qty}</span>
                              </div>
                            ))}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.72rem", color: "#444" }}>{tName + ": " + sym + tax}</span>
                              <span style={{ fontSize: "1rem", fontWeight: 800, color: "#FF3008" }}>{sym + total}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {STATUS_FLOW.map((s) => (
                              <button key={s} onClick={() => updateStatus(order.id, s)} disabled={isUpdating || order.status === s}
                                style={{ flex: 1, padding: "6px 2px", borderRadius: "7px", fontSize: "0.65rem", fontWeight: 700, cursor: isUpdating || order.status === s ? "not-allowed" : "pointer", border: order.status === s ? "1px solid " + sc.dot : "1px solid rgba(255,255,255,0.08)", background: order.status === s ? sc.bg : "transparent", color: order.status === s ? sc.text : "#444", fontFamily: "sans-serif", transition: "all 0.2s", opacity: isUpdating ? 0.5 : 1 }}>
                                {s}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {nextStatus && (
                              <button onClick={() => updateStatus(order.id, nextStatus)} disabled={isUpdating}
                                style={{ flex: 1, background: isUpdating ? "#222" : "#FF3008", color: isUpdating ? "#444" : "#fff", border: "none", padding: "10px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: "sans-serif", transition: "all 0.2s" }}>
                                {isUpdating ? "..." : "→ " + nextStatus}
                              </button>
                            )}
                            <button onClick={() => window.open("/receipt/" + order.id + "?restaurantId=" + restaurantId, "_blank")}
                              style={{ background: "rgba(255,255,255,0.06)", color: "#666", border: "none", padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
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
                    <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{sections.length + " sections · " + menu.length + " items · " + sym + " " + currency}</p>
                  </div>
                  <button onClick={() => { setShowAddSection(true); setNewSectionName(""); }} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>{"+ Add Section"}</button>
                </div>

                {showAddSection && (
                  <div style={{ background: "#161616", borderRadius: "14px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,48,8,0.3)" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "10px" }}>{"New Section"}</div>
                    <input style={inputStyle} placeholder="e.g. Starters, Main Course, Beverages" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddSection()} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button onClick={handleAddSection} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{saving ? "Saving..." : "Create"}</button>
                      <button onClick={() => setShowAddSection(false)} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {editSection && (
                  <div style={{ background: "#161616", borderRadius: "14px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,48,8,0.3)" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "10px" }}>{"Edit Section"}</div>
                    <input style={inputStyle} value={editSection.name} onChange={(e) => setEditSection({ ...editSection, name: e.target.value })} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button onClick={handleUpdateSection} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{saving ? "Saving..." : "Update"}</button>
                      <button onClick={() => setEditSection(null)} style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.85rem" }}>{"Cancel"}</button>
                    </div>
                  </div>
                )}

                {sections.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px", background: "#161616", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>{"📂"}</div>
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
                          <span style={{ background: "rgba(255,255,255,0.06)", color: "#555", fontSize: "0.68rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>{sectionItems(section.id).length + " items"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button onClick={(e) => { e.stopPropagation(); setEditSection({ ...section }); setShowAddSection(false); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "5px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", color: "#666", fontFamily: "sans-serif" }}>{"Edit"}</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} style={{ background: "rgba(255,48,8,0.1)", border: "none", color: "#FF3008", padding: "5px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", fontFamily: "sans-serif" }}>{"Delete"}</button>
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
                                  {[{ label: "Item Name *", key: "name", placeholder: "e.g. Paneer Tikka", type: "text" }, { label: "Price (" + sym + ") *", key: "price", placeholder: "e.g. 150", type: "number" }, { label: "Description", key: "desc", placeholder: "Short description", type: "text" }, { label: "Tag", key: "tag", placeholder: "e.g. Bestseller", type: "text" }].map((f) => (
                                    <div key={f.key}>
                                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                                      <input style={inputStyle} type={f.type} placeholder={f.placeholder} value={newItem[f.key]} onChange={(e) => setNewItem({ ...newItem, [f.key]: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                                {itemError && <div style={{ color: "#FF3008", fontSize: "0.78rem", marginTop: "8px" }}>{itemError}</div>}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                  <button onClick={handleAddItem} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{saving ? "Saving..." : "Add Item"}</button>
                                  <button onClick={() => { setShowAddItem(false); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", color: "#777", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{"Cancel"}</button>
                                </div>
                              </div>
                            )}
                            {editItem && editItem.sectionId === section.id && (
                              <div style={{ background: "rgba(255,48,8,0.05)", borderRadius: "12px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(255,48,8,0.2)" }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "12px", color: "#FF3008" }}>{"Edit Item"}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  {[{ label: "Item Name *", key: "name", type: "text" }, { label: "Price (" + sym + ") *", key: "price", type: "number" }, { label: "Description", key: "desc", type: "text" }, { label: "Tag", key: "tag", type: "text" }].map((f) => (
                                    <div key={f.key}>
                                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                                      <input style={inputStyle} type={f.type} value={editItem[f.key] || ""} onChange={(e) => setEditItem({ ...editItem, [f.key]: e.target.value })} />
                                    </div>
                                  ))}
                                </div>
                                {itemError && <div style={{ color: "#FF3008", fontSize: "0.78rem", marginTop: "8px" }}>{itemError}</div>}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                  <button onClick={handleUpdateItem} disabled={saving} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{saving ? "Saving..." : "Update"}</button>
                                  <button onClick={() => { setEditItem(null); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", color: "#777", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.82rem" }}>{"Cancel"}</button>
                                </div>
                              </div>
                            )}
                            {sectionItems(section.id).length === 0 ? (
                              <div style={{ textAlign: "center", padding: "20px", color: "#333", fontSize: "0.82rem" }}>{"No items yet."}</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                                {sectionItems(section.id).map((item) => (
                                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</div>
                                      {item.desc && <div style={{ fontSize: "0.72rem", color: "#444", marginTop: "2px" }}>{item.desc}</div>}
                                      <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FF3008", marginTop: "3px" }}>{sym + item.price}</div>
                                    </div>
                                    {item.tag && <span style={{ background: "rgba(255,48,8,0.1)", color: "#FF3008", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>{item.tag}</span>}
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button onClick={() => { setEditItem({ ...item }); setShowAddItem(false); setItemError(""); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", color: "#666", fontFamily: "sans-serif" }}>{"Edit"}</button>
                                      <button onClick={() => handleDeleteItem(item.id)} style={{ background: "rgba(255,48,8,0.1)", border: "none", color: "#FF3008", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", fontFamily: "sans-serif" }}>{"Del"}</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!showAddItem && !editItem && (
                              <button onClick={() => { setShowAddItem(true); setNewItem({ name: "", price: "", desc: "", tag: "", sectionId: section.id }); setEditItem(null); setItemError(""); }}
                                style={{ background: "rgba(255,48,8,0.08)", color: "#FF3008", border: "1px dashed rgba(255,48,8,0.25)", padding: "9px 16px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", width: "100%", transition: "all 0.2s" }}>
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
                    <div style={{ fontSize: "0.68rem", color: "#444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: 600 }}>{"Uncategorized"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {unsectionedItems.map((item) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FF3008", marginTop: "3px" }}>{sym + item.price}</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setEditItem({ ...item })} style={{ background: "rgba(255,255,255,0.06)", border: "none", padding: "6px 10px", borderRadius: "7px", fontWeight: 600, cursor: "pointer", fontSize: "0.72rem", color: "#666", fontFamily: "sans-serif" }}>{"Edit"}</button>
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
              <div className="fade-in" style={{ maxWidth: "600px" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"Settings"}</h2>
                  <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{"Manage your restaurant profile, localization and payments"}</p>
                </div>

                {/* Restaurant Info */}
                <div style={{ background: "#161616", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#FF3008", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{"🏪 Restaurant Info"}</div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Restaurant Name"}</label>
                    <input style={inputStyle} value={settingName} onChange={(e) => setSettingName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Number of Tables"}</label>
                    <input style={inputStyle} type="number" value={settingTables} onChange={(e) => setSettingTables(e.target.value)} min="1" max="100" />
                  </div>
                  <button onClick={handleSaveSettings} style={{ background: settingSaved ? "rgba(74,222,128,0.15)" : "#FF3008", color: settingSaved ? "#4ADE80" : "#fff", border: settingSaved ? "1px solid rgba(74,222,128,0.3)" : "none", padding: "13px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", fontFamily: "sans-serif", transition: "all 0.3s" }}>
                    {settingSaved ? "✓ Saved!" : "Save Restaurant Info"}
                  </button>
                </div>

                {/* Localization */}
                <div style={{ background: "#161616", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#FFC107", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{"🌍 Localization & Currency"}</div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Country"}</label>
                    <select value={country} onChange={(e) => {
                      const selected = COUNTRIES.find(c => c.country === e.target.value);
                      if (selected) { setCountry(selected.country); setCurrency(selected.currency); setCurrencySymbol(selected.symbol); setTaxName(selected.taxName); setTaxRate(selected.taxRate); setTimezone(selected.timezone); }
                    }} style={{ ...inputStyle, cursor: "pointer" }}>
                      {COUNTRIES.map((c) => (
                        <option key={c.country} value={c.country}>{c.flag + " " + c.country + " (" + c.symbol + " " + c.currency + ")"}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Currency Code"}</label>
                      <input style={inputStyle} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="INR, USD, EUR..." />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Currency Symbol"}</label>
                      <input style={inputStyle} value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} placeholder="₹, $, €, £..." />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Tax Name"}</label>
                      <input style={inputStyle} value={taxName} onChange={(e) => setTaxName(e.target.value)} placeholder="GST, VAT, Tax..." />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Tax Rate (%)"}</label>
                      <input style={inputStyle} type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="18" min="0" max="30" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Timezone"}</label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ background: "rgba(255,193,7,0.05)", border: "1px solid rgba(255,193,7,0.15)", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#FFC107", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>{"Preview"}</div>
                    <div style={{ fontSize: "0.85rem", color: "#888", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>{"Item Price: "}<strong style={{ color: "#fff" }}>{currencySymbol + "150"}</strong></span>
                      <span>{taxName + " (" + taxRate + "%): "}<strong style={{ color: "#fff" }}>{currencySymbol + Math.round(150 * Number(taxRate) / 100)}</strong></span>
                      <span>{"Total: "}<strong style={{ color: "#FF3008" }}>{currencySymbol + (150 + Math.round(150 * Number(taxRate) / 100))}</strong></span>
                    </div>
                  </div>
                  <button onClick={handleSaveLocalization} disabled={saving} style={{ background: saving ? "#333" : "#FFC107", color: saving ? "#666" : "#000", border: "none", padding: "13px", borderRadius: "10px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.9rem", fontFamily: "sans-serif" }}>
                    {saving ? "Saving..." : "🌍 Save Localization Settings"}
                  </button>
                </div>

                {/* Payment Settings */}
                <div style={{ background: "#161616", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#818CF8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{"💳 Payment Setup (Razorpay)"}</div>
                  <p style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.6 }}>{"Customers pay directly to your account. Get your keys from "}<a href="https://razorpay.com" target="_blank" rel="noreferrer" style={{ color: "#818CF8" }}>{"razorpay.com"}</a></p>
                  <div style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontSize: "0.72rem", color: "#818CF8", fontWeight: 600, marginBottom: "6px" }}>{"How to get keys:"}</div>
                    <div style={{ fontSize: "0.72rem", color: "#555", lineHeight: 1.8 }}>
                      {"1. Go to razorpay.com → Sign up"}<br />
                      {"2. Settings → API Keys → Generate Key"}<br />
                      {"3. Copy Key ID and Key Secret below"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Razorpay Key ID"}</label>
                    <input style={inputStyle} value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} placeholder="rzp_live_xxxxxxxxxxxxxxxx" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>{"Razorpay Key Secret"}</label>
                    <input style={{ ...inputStyle, fontFamily: "monospace" }} type="password" value={razorpayKeySecret} onChange={(e) => setRazorpayKeySecret(e.target.value)} placeholder="••••••••••••••••" />
                  </div>
                  {paymentSaved && <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "10px", padding: "12px", fontSize: "0.82rem", color: "#4ADE80", fontWeight: 600 }}>{"✓ Payment settings saved!"}</div>}
                  {paymentError && <div style={{ background: "rgba(255,48,8,0.1)", border: "1px solid rgba(255,48,8,0.2)", borderRadius: "10px", padding: "12px", fontSize: "0.82rem", color: "#FF3008" }}>{paymentError}</div>}
                  <button onClick={handleSavePayment} disabled={savingPayment} style={{ background: savingPayment ? "#333" : "#818CF8", color: savingPayment ? "#666" : "#fff", border: "none", padding: "13px", borderRadius: "10px", fontWeight: 700, cursor: savingPayment ? "not-allowed" : "pointer", fontSize: "0.9rem", fontFamily: "sans-serif" }}>
                    {savingPayment ? "Saving..." : "💳 Save Payment Settings"}
                  </button>
                  {restaurant.razorpayKeyId && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "#4ADE80" }}>
                      <div style={{ width: "8px", height: "8px", background: "#4ADE80", borderRadius: "50%" }} />
                      {"Payment is active — customers can pay online!"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR CODES TAB */}
            {tab === "qrcodes" && (
              <div className="fade-in">
                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{"QR Codes"}</h2>
                    <p style={{ color: "#555", fontSize: "0.82rem", marginTop: "4px" }}>{"Auto-generated QR codes for each table"}</p>
                  </div>
                  <button onClick={() => {
                    Array.from({ length: Number(restaurant.tableCount) }, (_, i) => i + 1).forEach((t) => {
                      setTimeout(() => {
                        const canvas = document.getElementById("qr-canvas-" + t);
                        if (canvas) {
                          const dlCanvas = document.createElement("canvas");
                          dlCanvas.width = 300; dlCanvas.height = 380;
                          const ctx = dlCanvas.getContext("2d");
                          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 300, 380);
                          ctx.fillStyle = "#FF3008"; ctx.fillRect(0, 0, 300, 60);
                          ctx.fillStyle = "#fff"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
                          ctx.fillText(restaurant.name, 150, 28);
                          ctx.font = "14px sans-serif"; ctx.fillText("Table " + t, 150, 50);
                          ctx.drawImage(canvas, 50, 80, 200, 200);
                          ctx.fillStyle = "#333"; ctx.font = "bold 16px sans-serif"; ctx.fillText("Scan to Order", 150, 310);
                          ctx.fillStyle = "#999"; ctx.font = "11px sans-serif"; ctx.fillText("No app needed · Order from your phone", 150, 332);
                          ctx.fillStyle = "#FF3008"; ctx.font = "bold 13px sans-serif"; ctx.fillText("Powered by Platfo", 150, 360);
                          const link = document.createElement("a");
                          link.download = restaurant.name + "-Table-" + t + "-QR.png";
                          link.href = dlCanvas.toDataURL("image/png");
                          link.click();
                        }
                      }, t * 300);
                    });
                  }} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
                    {"⬇️ Download All"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {Array.from({ length: Number(restaurant.tableCount) }, (_, i) => i + 1).map((t) => {
                    const url = typeof window !== "undefined" ? window.location.origin + "/menu?restaurantId=" + restaurantId + "&table=" + t : "";
                    return <QRCard key={t} table={t} url={url} restaurantName={restaurant.name} />;
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

function QRCard({ table, url, restaurantName }) {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    if (window.QRCode) { generateQR(); }
    else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = generateQR;
      document.head.appendChild(script);
    }
    function generateQR() {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      new window.QRCode(containerRef.current, { text: url, width: 160, height: 160, colorDark: "#000000", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.H });
      setQrReady(true);
    }
  }, [url]);

  const buildCanvas = () => {
    const img = containerRef.current?.querySelector("img") || containerRef.current?.querySelector("canvas");
    if (!img) return null;
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = 320; dlCanvas.height = 420;
    const ctx = dlCanvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 320, 420);
    ctx.fillStyle = "#FF3008"; ctx.fillRect(0, 0, 320, 70);
    ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(restaurantName.length > 20 ? restaurantName.substring(0, 20) + "..." : restaurantName, 160, 32);
    ctx.font = "15px sans-serif"; ctx.fillText("Table " + table, 160, 56);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 200; tempCanvas.height = 200;
    tempCanvas.getContext("2d").drawImage(img, 0, 0, 200, 200);
    ctx.drawImage(tempCanvas, 60, 90, 200, 200);
    ctx.fillStyle = "#111"; ctx.font = "bold 18px sans-serif"; ctx.fillText("Scan to Order", 160, 322);
    ctx.fillStyle = "#888"; ctx.font = "12px sans-serif"; ctx.fillText("No app needed · Just scan & order", 160, 346);
    ctx.fillStyle = "#FF3008"; ctx.font = "bold 14px sans-serif"; ctx.fillText("Powered by Platfo", 160, 400);
    return dlCanvas;
  };

  const handleDownload = () => {
    const dlCanvas = buildCanvas();
    if (!dlCanvas) return;
    const link = document.createElement("a");
    link.download = restaurantName + "-Table-" + table + "-QR.png";
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const dlCanvas = buildCanvas();
    if (!dlCanvas) return;
    const img = dlCanvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Table ${table} QR</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;}img{max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,0.15);border-radius:16px;}@media print{body{background:white;}}</style></head><body><img src="${img}" onload="window.print()"/></body></html>`);
  };

  return (
    <div style={{ background: "#161616", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ background: "#FF3008", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>{table}</div>
        <span style={{ fontSize: "0.78rem", color: "#555", fontWeight: 600 }}>{"Table " + table}</span>
      </div>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px" }}>
        {!qrReady && <div style={{ color: "#ccc", fontSize: "0.75rem" }}>{"Generating..."}</div>}
        <div ref={containerRef} id={"qr-canvas-" + table} style={{ display: qrReady ? "block" : "none" }} />
      </div>
      <div style={{ fontSize: "0.62rem", color: "#444", wordBreak: "break-all", textAlign: "center", lineHeight: 1.4 }}>{url}</div>
      <div style={{ display: "flex", gap: "6px", width: "100%" }}>
        <button onClick={handleDownload} style={{ flex: 1, background: "rgba(255,48,8,0.1)", border: "1px solid rgba(255,48,8,0.2)", color: "#FF3008", padding: "8px 4px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.68rem", fontFamily: "sans-serif" }}>{"⬇️ Save"}</button>
        <button onClick={handlePrint} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "8px 4px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.68rem", fontFamily: "sans-serif" }}>{"🖨️ Print"}</button>
        <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ flex: 1, background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", border: copied ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,255,255,0.08)", color: copied ? "#4ADE80" : "#888", padding: "8px 4px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.68rem", fontFamily: "sans-serif", transition: "all 0.2s" }}>{copied ? "✓ Copied" : "📋 Copy"}</button>
      </div>
    </div>
  );
}
