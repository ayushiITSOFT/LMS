import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <section className="home-page">
      <h1>Unauthorized</h1>
      <p>Your account does not have access to that area.</p>
      <Link to="/auth-test">Return to your account</Link>
    </section>
  );
}
