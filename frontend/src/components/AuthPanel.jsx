import { useState } from "react";
import Icon from "./Icon";

export default function AuthPanel({ onAuthenticated, initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message ||
            data.errors?.[0]?.msg ||
            "We couldn’t sign you in. Please check your details.",
        );
      onAuthenticated(data.token);
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "This is taking longer than expected. Please try again."
          : err.message === "Failed to fetch"
            ? "Unable to connect. Please try again in a moment."
            : err.message,
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="auth-panel">
      <span className="icon-tile">
        <Icon name="leaf" size={26} />
      </span>
      <p className="eyebrow mt-6">YOUR NEXT CHAPTER</p>
      <h2 id="auth-title">
        {mode === "login" ? "Welcome back." : "Make room for you."}
      </h2>
      <p className="muted">
        {mode === "login"
          ? "A little check-in can make a big difference."
          : "Start building a healthier everyday, one small step at a time."}
      </p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        {mode === "signup" && (
          <label>
            Your name
            <input
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alex Morgan"
            />
          </label>
        )}
        <label>
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button
          disabled={pending}
          className="primary-btn w-full justify-center"
          type="submit"
        >
          {pending
            ? "One moment…"
            : mode === "login"
              ? "Log in"
              : "Create your account"}
          {!pending && <Icon />}
        </button>
      </form>
      <p className="auth-switch">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <button
          disabled={pending}
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Get started" : "Log in"}
        </button>
      </p>
    </div>
  );
}
