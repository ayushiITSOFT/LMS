import { API_BASE_URL } from "../config/env.js";

export function HomePage() {
  return (
    <section className="home-page">
      <h1>Standalone LMS</h1>
      <p>Frontend setup is ready.</p>
      <small>Backend: {API_BASE_URL}</small>
    </section>
  );
}
