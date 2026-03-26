import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Receipt() {
  const router = useRouter();
  const { orderId, restaurantId } = router.query;
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !restaurantId) return;
    Promise.all([
      fetch("/api/order?restaurantId=" + restaurantId).then((r) => r.json()),
      fetch("/api/restaurant?id=" + restaurantId).then((r) => r.json()),
    ]).then(([orderData, restData]) => {
      const found = (orderData.orders || []).find((o) => o.id === orderId);
      setOrder(found);
      setRestaurant(restData.restaurant);
      setLoading(false);
    });
  }, [orderId, restaurantId]);

  useEffect(() => {
    if (order && restaurant) {
      setTimeout(() => window.print(), 800);
    }
  }, [order, restaurant]);

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "monospace" }}>
      {"Loading receipt..."}
    </div>
  );

  if (!order) return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "monospace" }}>
      {"Order not found."}
    </div>
  );

  const date = new Date(order.timestamp);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; background: #f5f5f5; }
        @media print {
          body { margin: 0; background: #fff; }
          .no-print { display: none !important; }
          .receipt { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      {/* Print Buttons */}
      <div className="no-print" style={{ textAlign: "center", padding: "20px", background: "#111" }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#FF3008", color: "#fff", border: "none", padding: "12px 32px", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", marginRight: "10px", fontFamily: "sans-serif" }}>
          {"Print Receipt"}
        </button>
        <button
          onClick={() => window.close()}
          style={{ background: "#555", color: "#fff", border: "none", padding: "12px 32px", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
          {"Close"}
        </button>
      </div>

      {/* Receipt */}
      <div className="receipt" style={{ maxWidth: "320px", margin: "20px auto", padding: "24px 20px", background: "#fff", boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", borderBottom: "2px dashed #333", paddingBottom: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.5px" }}>
            {restaurant ? restaurant.name : "Restaurant"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#555", marginTop: "4px" }}>
            {"Tax Invoice / Receipt"}
          </div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: "14px", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#555" }}>{"Order ID:"}</span>
            <span style={{ fontWeight: 700 }}>{order.id}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#555" }}>{"Table:"}</span>
            <span style={{ fontWeight: 700 }}>{"Table " + order.tableNumber}</span>
          </div>
          {order.customerName && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "#555" }}>{"Customer:"}</span>
              <span style={{ fontWeight: 700 }}>{order.customerName}</span>
            </div>
          )}
          {order.customerPhone && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "#555" }}>{"Phone:"}</span>
              <span style={{ fontWeight: 700 }}>{order.customerPhone}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#555" }}>{"Date:"}</span>
            <span style={{ fontWeight: 700 }}>{dateStr}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#555" }}>{"Time:"}</span>
            <span style={{ fontWeight: 700 }}>{timeStr}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "2px dashed #333", marginBottom: "12px" }} />

        {/* Items Header */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#555", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase" }}>
          <span style={{ flex: 1 }}>{"Item"}</span>
          <span style={{ minWidth: "70px", textAlign: "center" }}>{"Qty x Price"}</span>
          <span style={{ minWidth: "50px", textAlign: "right" }}>{"Amt"}</span>
        </div>

        {/* Items */}
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "8px" }}>
            <span style={{ flex: 1 }}>{item.name}</span>
            <span style={{ minWidth: "70px", textAlign: "center" }}>{item.qty + " x " + item.price}</span>
            <span style={{ fontWeight: 700, minWidth: "50px", textAlign: "right" }}>{"Rs." + item.price * item.qty}</span>
          </div>
        ))}

        {/* Divider */}
        <div style={{ borderTop: "2px dashed #333", marginBottom: "12px", marginTop: "12px" }} />

        {/* Bill Summary */}
        <div style={{ marginBottom: "14px", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "#555" }}>{"Subtotal:"}</span>
            <span>{"Rs. " + order.subtotal}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "#555" }}>{"CGST (9%):"}</span>
            <span>{"Rs. " + Math.round(order.gst / 2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#555" }}>{"SGST (9%):"}</span>
            <span>{"Rs. " + Math.round(order.gst / 2)}</span>
          </div>
          <div style={{ borderTop: "2px dashed #333", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 900 }}>
            <span>{"TOTAL:"}</span>
            <span>{"Rs. " + order.total}</span>
          </div>
        </div>

        {/* Status */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={{ background: order.status === "Delivered" ? "#D4EDDA" : "#FFF3CD", color: order.status === "Delivered" ? "#155724" : "#856404", padding: "4px 16px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
            {"Status: " + order.status}
          </span>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "2px dashed #333", paddingTop: "14px", textAlign: "center", fontSize: "0.78rem", color: "#555" }}>
          <div style={{ marginBottom: "4px", fontWeight: 700 }}>{"Thank you for dining with us!"}</div>
          <div style={{ marginBottom: "4px" }}>{"Please visit again"}</div>
          <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "8px" }}>{"Powered by Platfo POS"}</div>
        </div>

      </div>
    </>
  );
}