import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup");
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F0F0F",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      color: "#fff"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "48px", height: "48px",
          background: "#FF3008", borderRadius: "12px",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.5rem",
          margin: "0 auto 16px",
          boxShadow: "0 0 20px rgba(255,48,8,0.4)"
        }}>{"🍽️"}</div>
        <p style={{ color: "#555", fontSize: "0.9rem" }}>{"Loading Platfo..."}</p>
      </div>
    </div>
  );
}
