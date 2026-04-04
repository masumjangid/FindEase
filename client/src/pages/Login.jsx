import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Log in to FindEase</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Only @poornima.edu.in email addresses can log in.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          method="post"
          autoComplete="on"
        >
          <label htmlFor="login-email" className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@poornima.edu.in"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <label htmlFor="login-password" className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium text-slate-900 underline dark:text-slate-100">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
