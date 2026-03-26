import Head from "next/head";
import { useRouter } from "next/router";

export default function VerifySuccess() {
  const router = useRouter();
  const { name, error } = router.query;

  if (error) {
    return (
      <>
        <Head><title>{"Verification Failed — Platfo"}</title></Head>
        <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "48px 36px", maxWidth: "420px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❌</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", marginBottom: "12px" }}>
              {"Verification Failed"}
            </h2>
            <p style={{ color: "#D00000", marginBottom: "28px", fontSize: "0.95rem" }}>
              {error ? decodeURIComponent(String(error)) : "Something went wrong."}
            </p>
            <button onClick={() => router.push("/signup")} style={{ background: "#FF3008", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: "0.95rem", fontFamily: "sans-serif" }}>
              {"Try Signing Up Again"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>{"Email Verified — Platfo"}</title></Head>
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: "24px", padding: "48px 36px", maxWidth: "420px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ width: "80px", height: "80px", background: "#28A745", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 24px" }}>
            {"✓"}
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", marginBottom: "12px" }}>
            {"Email Verified!"}
          </h2>
          <p style={{ color: "#555", marginBottom: "8px", lineHeight: 1.6 }}>
            {"Welcome to Platfo"}{name ? ", " + decodeURIComponent(String(name)) : ""}{"!"}
          </p>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "28px" }}>
            {"Your account is active. Check your email for login credentials."}
          </p>
          <a href="/admin" style={{ display: "block", background: "#FF3008", color: "#fff", textDecoration: "none", padding: "16px", borderRadius: "12px", fontWeight: 700, fontSize: "1rem", marginBottom: "12px" }}>
            {"Login to Dashboard"}
          </a>
          <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
            {"Welcome email with credentials sent to your inbox!"}
          </p>
        </div>
      </div>
    </>
  );
}
