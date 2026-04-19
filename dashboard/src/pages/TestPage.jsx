import { Link } from "react-router-dom";

/**
 * Minimal page to verify React + Vite + routing. Open: http://localhost:5173/#/test
 */
export default function TestPage() {
  return (
    <div className="test-page">
      <div className="test-page__blue-bar" role="img" aria-label="Test blue bar" />
      <p className="test-page__ok">If you see a bright blue bar above, React is rendering.</p>
      <Link className="test-page__link" to="/">
        ← Back to dashboard
      </Link>
    </div>
  );
}
