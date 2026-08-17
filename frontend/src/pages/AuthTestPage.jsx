import { useAuth } from "../features/auth/useAuth.js";

export function AuthTestPage() {
  const { user } = useAuth();

  return (
    <section className="home-page">
      <h1>Authentication test</h1>
      <p>You are logged in as {user?.username}.</p>
      <small>{user?.email}</small>
    </section>
  );
}
