import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    const nextErrors = {
      username: !values.username.trim() ? "Username is required." : "",
      email: !values.email.trim() ? "Email is required." : "",
      password: values.password.length < 8 ? "Password must be at least 8 characters." : "",
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <h1>Register</h1>
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
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={updateField}
            type="email"
            value={values.email}
          />
          {fieldError(errors, "email") ? (
            <span className="field-error">{fieldError(errors, "email")}</span>
          ) : null}
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
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
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
