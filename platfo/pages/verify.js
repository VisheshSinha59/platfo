import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Verify() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/verify?token=" + token)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          setTimeout(() => router.push("/admin"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Invalid or expired link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [token]);

  return (
    <>
      <Head><title>{"Verify Email — Platfo"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "40px 32px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {status === "verifying" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"⏳"}</div>
              <h2 style={{ color: "#111", marginBottom: "8px" }}>{"Verifying..."}</h2>
              <p style={{ color: "#888" }}>{"Please wait while we verify your email."}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"✅"}</div>
              <h2 style={{ color: "#111", marginBottom: "8px" }}>{"Email Verified!"}</h2>
              <p style={{ color: "#555", marginBottom: "24px" }}>{message}</p>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>{"Redirecting to login..."}</p>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"❌"}</div>
              <h2 style={{ color: "#111", marginBottom: "8px" }}>{"Verification Failed"}</h2>
              <p style={{ color: "#D00000", marginBottom: "24px" }}>{message}</p>
              <a href="/signup" style={{ display: "block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 700 }}>{"Sign Up Again"}</a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
