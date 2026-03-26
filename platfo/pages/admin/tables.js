import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function TableHistory() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("restaurant");
    if (!stored) { router.push("/admin"); return; }
    const r = JSON.parse(stored);
    setRestaurant(r);
    setRestaurantId(r.id);
  }, [router]);

  useEffect(() => {
    if (!restaurantId) return;
    fetch("/api/order?restaurantId=" + restaurantId)
      .then((r) => r.json())
      .then((data) => {
        const orders = data.orders || [];
        const tables = {};
        orders.forEach((order) => {
          const t = order.tableNumber;
          if (!tables[t]) {
            tables[t] = {
              tableNumber: t,
              orders: [],
              totalRevenue: 0,
              totalOrders: 0,
            };
          }
          tables[t].orders.push(order);
          tables[t].totalRevenue += order.total || 0;
          tables[t].totalOrders++;
        });
        setTableData(Object.values(tables).sort((a, b) => a.tableNumber - b.tableNumber));
        setLoading(false);
      });
  }, [restaurantId]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  if (!restaurant) return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>{"Loading..."}</div>
  );

  return (
    <>
      <Head><title>{"Table History"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#F0F2F5", fontFamily: "sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#111", color: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{restaurant.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#FF3008", fontWeight: 600, marginTop: "2px" }}>
                {"Table-wise Order History"}
              </div>
            </div>
            <button onClick={() => router.push("/admin/dashboard")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, fontFamily: "sans-serif" }}>
              {"Back to Dashboard"}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#AAA" }}>{"Loading..."}</div>
          ) : tableData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#AAA" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🪑</div>
              <p style={{ fontWeight: 600 }}>{"No orders yet."}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}>

              {/* Table List */}
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111", marginBottom: "14px" }}>
                  {"All Tables (" + tableData.length + ")"}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tableData.map((t) => (
                    <div key={t.tableNumber} onClick={() => setSelectedTable(t)} style={{
                      background: selectedTable?.tableNumber === t.tableNumber ? "#FF3008" : "#fff",
                      borderRadius: "14px", padding: "16px", cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      border: selectedTable?.tableNumber === t.tableNumber ? "2px solid #FF3008" : "2px solid transparent",
                      transition: "all 0.15s"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1rem", color: selectedTable?.tableNumber === t.tableNumber ? "#fff" : "#111" }}>
                            {"Table " + t.tableNumber}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: selectedTable?.tableNumber === t.tableNumber ? "rgba(255,255,255,0.8)" : "#888", marginTop: "3px" }}>
                            {t.totalOrders + " orders"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: selectedTable?.tableNumber === t.tableNumber ? "#fff" : "#FF3008" }}>
                            {"Rs. " + t.totalRevenue}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: selectedTable?.tableNumber === t.tableNumber ? "rgba(255,255,255,0.7)" : "#aaa" }}>
                            {"total spent"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div>
                {!selectedTable ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "#AAA", background: "#fff", borderRadius: "16px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>👈</div>
                    <p style={{ fontWeight: 600 }}>{"Select a table to view orders"}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111" }}>
                        {"Table " + selectedTable.tableNumber + " — All Orders"}
                      </h2>
                      <div style={{ background: "#FF3008", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700 }}>
                        {"Total: Rs. " + selectedTable.totalRevenue}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {selectedTable.orders.map((order) => (
                        <div key={order.id} style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #E5E7EB" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div>
                              <div style={{ fontWeight: 800, color: "#111" }}>{order.id}</div>
                              <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>{formatDate(order.timestamp)}</div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", background: order.status === "Delivered" ? "#D4EDDA" : "#FFF3CD", color: order.status === "Delivered" ? "#155724" : "#856404" }}>
                                {order.status}
                              </span>
                              <a href={"/receipt/" + order.id + "?restaurantId=" + restaurantId} target="_blank" rel="noreferrer"
                                style={{ background: "#111", color: "#fff", padding: "4px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                                {"Print"}
                              </a>
                            </div>
                          </div>
                          <div style={{ borderTop: "1px dashed #EEE", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#444" }}>
                                <span>{item.emoji + " " + item.name + " x" + item.qty}</span>
                                <span style={{ fontWeight: 700 }}>{"Rs. " + item.price * item.qty}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ borderTop: "1px dashed #EEE", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontSize: "0.82rem", color: "#888" }}>
                              {"Subtotal: Rs." + order.subtotal + " + GST: Rs." + order.gst}
                            </div>
                            <div style={{ fontWeight: 800, color: "#FF3008" }}>{"Rs. " + order.total}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}