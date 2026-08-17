import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(
    location.state?.registered ? "Account created. You can log in now." : ""
  );
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    if (!values.username.trim() || !values.password) {
      setErrors({
        username: !values.username.trim() ? "Username is required." : "",
        password: !values.password ? "Password is required." : "",
      });
      return;
    }

    setSubmitting(true);

    try {
      await login({ username: values.username.trim(), password: values.password });
      navigate(location.state?.from?.pathname || "/auth-test", { replace: true });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to login. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <h1>Login</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {message ? <p className="form-error">{message}</p> : null}
        <label>
          Username
          <input
            autoComplete="username"
            name="username"
            onChange={updateField}
            type="text"
            value={values.username}
          />
          {fieldError(errors, "username") ? (
            <span className="field-error">{fieldError(errors, "username")}</span>
          ) : null}
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            name="password"
            onChange={updateField}
            type="password"
            value={values.password}
          />
          {fieldError(errors, "password") ? (
            <span className="field-error">{fieldError(errors, "password")}</span>
          ) : null}
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="auth-switch">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
