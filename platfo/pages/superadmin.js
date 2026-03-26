import { useState } from "react";
import Head from "next/head";

export default function SuperAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", username: "", password: "", tableCount: "10" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const unlock = async () => {
    if (adminKey !== "SUPERADMIN123") { setError("Wrong admin key."); return; }
    setUnlocked(true);
    setError("");
    const res = await fetch("/api/restaurant?action=all");
    const data = await res.json();
    setRestaurants(data.restaurants || []);
  };

  const createRestaurant = async () => {
    if (!form.name || !form.username || !form.password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    const res = await fetch("/api/restaurant?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, adminKey }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setMessage("Restaurant created successfully!");
    setForm({ name: "", username: "", password: "", tableCount: "10" });
    const res2 = await fetch("/api/restaurant?action=all");
    const data2 = await res2.json();
    setRestaurants(data2.restaurants || []);
    setTimeout(() => setMessage(""), 3000);
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "2px solid #EEE", fontSize: "0.95rem", outline: "none",
    fontFamily: "sans-serif", marginTop: "4px", boxSizing: "border-box"
  };

  return (
    <>
      <Head><title>{"Super Admin"}</title></Head>
      <div style={{
        minHeight: "100vh", background: "#111",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", fontFamily: "sans-serif"
      }}>
        <div style={{
          background: "#fff", borderRadius: "24px", padding: "40px 32px",
          maxWidth: "500px", width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🔐</div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111" }}>
              Super Admin
            </h1>
            <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "4px" }}>
              Manage all restaurants
            </p>
          </div>

          {!unlocked ? (
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px" }}>
                Admin Key
              </label>
              <input
                type="password"
                style={inputStyle}
                placeholder="Enter super admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
              />
              {error && (
                <p style={{ color: "#D00000", fontSize: "0.85rem", marginTop: "8px" }}>{error}</p>
              )}
              <button onClick={unlock} style={{
                width: "100%", background: "#FF3008", color: "#fff", border: "none",
                padding: "16px", borderRadius: "12px", fontWeight: 700, cursor: "pointer",
                fontSize: "1rem", marginTop: "14px", fontFamily: "sans-serif"
              }}>
                Unlock
              </button>
              <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.78rem", marginTop: "12px" }}>
                Demo key: SUPERADMIN123
              </p>
            </div>
          ) : (
            <>
              {/* Create Restaurant Form */}
              <div style={{
                background: "#FFF5F2", borderRadius: "16px", padding: "20px",
                marginBottom: "24px", border: "2px solid #FFE0D6"
              }}>
                <h3 style={{ fontWeight: 800, color: "#111", marginBottom: "16px" }}>
                  Create New Restaurant
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>
                      Restaurant Name
                    </label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Pizza Palace"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>
                      Username
                    </label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. pizzapalace"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>
                      Password
                    </label>
                    <input
                      style={inputStyle}
                      type="password"
                      placeholder="Set a password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555" }}>
                      Number of Tables
                    </label>
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="10"
                      value={form.tableCount}
                      onChange={(e) => setForm({ ...form, tableCount: e.target.value })}
                    />
                  </div>

                  {error && (
                    <p style={{ color: "#D00000", fontSize: "0.85rem" }}>{error}</p>
                  )}
                  {message && (
                    <p style={{ color: "#28A745", fontSize: "0.85rem", fontWeight: 700 }}>{message}</p>
                  )}

                  <button onClick={createRestaurant} style={{
                    background: "#FF3008", color: "#fff", border: "none",
                    padding: "14px", borderRadius: "12px", fontWeight: 700,
                    cursor: "pointer", fontSize: "0.95rem", fontFamily: "sans-serif"
                  }}>
                    Create Restaurant
                  </button>
                </div>
              </div>

              {/* Restaurants List */}
              <h3 style={{ fontWeight: 800, color: "#111", marginBottom: "14px" }}>
                {"All Restaurants (" + restaurants.length + ")"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {restaurants.map((r) => (
                  <div key={r.id} style={{
                    background: "#F9F9F9", borderRadius: "12px", padding: "14px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    border: "1.5px solid #EEE"
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#111" }}>{r.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "2px" }}>
                        {"@" + r.username + " — " + r.tableCount + " tables — " + (r.menu ? r.menu.length : 0) + " items"}
                      </div>
                    </div>
                    <a href="/admin" style={{
                      background: "#111", color: "#fff", padding: "6px 12px",
                      borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700,
                      textDecoration: "none"
                    }}>
                      Login
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}