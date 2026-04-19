/**
 * Minimal React page — open: http://localhost:5173/#/blue
 * If you see the blue bar, React + Vite + router are working.
 */
export default function BlueBarPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "2rem",
        color: "#0f172a",
      }}
    >
      <h1 style={{ fontSize: "1.15rem", margin: "0 0 0.75rem" }}>React blue bar test</h1>
      <p style={{ margin: "0 0 1rem", maxWidth: "40rem", lineHeight: 1.5 }}>
        If you see a blue bar below, the React bundle loaded successfully. Use the main app at <a href="#/">#/</a> or{" "}
        <a href="#/test">#/test</a>.
      </p>
      <div
        style={{
          height: 48,
          maxWidth: 480,
          borderRadius: 8,
          background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
        }}
        role="img"
        aria-label="Blue test bar"
      />
    </div>
  );
}
