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

export default function AdminDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [filter, setFilter] = useState("All");
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
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("restaurant");
    if (!stored) { router.push("/admin"); return; }
    const r = JSON.parse(stored);
    console.log("Loaded restaurant from localStorage:", r);
    setRestaurant(r);
    setRestaurantId(r.id);
    setMenu(r.menu || []);
    setSettingName(r.name);
    setSettingTables(r.tableCount);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      console.log("Fetching orders for restaurantId:", restaurantId);
      const res = await fetch("/api/order?restaurantId=" + restaurantId);
      const data = await res.json();
      console.log("Orders response:", data);
      setOrders(data.orders || []);
      setOrderError("");
    } catch (err) {
      console.log("Fetch orders error:", err);
      setOrderError("Failed to load orders.");
    }
  }, [restaurantId]);

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
    } catch (err) {
      console.log("Refresh menu error:", err);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId, fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      console.log("Update status response:", data);
      await fetchOrders();
    } catch (err) {
      console.log("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
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

  const tabs = ["All", ...STATUS_FLOW];
  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);
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
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 20px", display: "flex" }}>
            {["orders", "menu", "settings", "qrcodes"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, color: tab === t ? "#FF3008" : "#888", borderBottom: tab === t ? "3px solid #FF3008" : "3px solid transparent", textTransform: "capitalize", fontFamily: "sans-serif" }}>
                {t === "qrcodes" ? "QR Codes" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                  { label: "Total Orders", value: orders.length },
                  { label: "Pending", value: orders.filter((o) => o.status !== "Delivered").length },
                  { label: "Revenue", value: "Rs. " + totalRevenue },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: "#fff", borderRadius: "16px", padding: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FF3008" }}>{stat.value}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "4px", fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Filter Tabs */}
              <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "16px", display: "flex", overflowX: "auto" }}>
                {tabs.map((t) => (
                  <button key={t} onClick={() => setFilter(t)} style={{ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: filter === t ? "#FF3008" : "#888", borderBottom: filter === t ? "3px solid #FF3008" : "3px solid transparent", whiteSpace: "nowrap", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
                    {t}
                    {t !== "All" && counts[t] > 0 && (
                      <span style={{ background: "#FF3008", color: "#fff", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "10px" }}>{counts[t]}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Error */}
              {orderError && (
                <div style={{ background: "#FFF0F0", border: "1px solid #FFB3B3", borderRadius: "12px", padding: "12px 16px", color: "#D00000", marginBottom: "16px", fontSize: "0.9rem" }}>
                  {orderError}
                </div>
              )}

              {/* Orders Grid */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#AAA" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📋</div>
                  <p style={{ fontWeight: 600 }}>{"No orders yet."}</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "8px", color: "#BBB" }}>{"Orders will appear here automatically."}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {filtered.map((order) => {
                    const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
                    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                    const isUpdating = updatingId === order.id;
                    const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
                    const gst = order.gst || Math.round(subtotal * 0.18);
                    const total = order.total || subtotal + gst;
                    return (
                      <div key={order.id} style={{ background: "#fff", borderRadius: "18px", padding: "18px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1.5px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 800, color: "#111" }}>{order.id}</div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>{formatTime(order.timestamp)}</div>
                          </div>
                          <div style={{ background: "#111", color: "#fff", padding: "5px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>{"Table " + order.tableNumber}</div>
                        </div>
                        <div style={{ borderTop: "1px dashed #EEE", borderBottom: "1px dashed #EEE", padding: "10px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#444" }}>
                              <span>{item.emoji + " " + item.name + " x" + item.qty}</span>
                              <span style={{ fontWeight: 700 }}>{"Rs." + item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.78rem", color: "#888" }}>{"Status"}</span>
                          <span style={{ background: sc.bg, color: sc.text, padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                            {order.status}
                          </span>
                        </div>
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