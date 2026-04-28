import { useState } from "react";
import { supabase } from "../lib/supabase";

function AuthScreen() {
  const [mode, setMode] = useState("sign-in");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              full_name: formState.name,
            },
          },
        });

        if (error) {
          throw error;
        }

        setStatus({
          type: "success",
          message: "Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (error) {
          throw error;
        }

        setStatus({
          type: "success",
          message: "Signed in successfully.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong while signing in.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-panel">
            <span className="eyebrow">Ledgr account</span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Sign in to Ledgr to save budgets, transactions, imports, and personalized financial insights.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Keep your budget and transaction history in one place with a secure account and cloud-backed saving.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="insight-row">Account-based login with email and password</div>
              <div className="insight-row">Your Ledgr data saved to your own account</div>
              <div className="insight-row">Built for imports, budgeting, and coaching in one place</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h2>
                <p className="panel-subtitle">
                  {mode === "sign-in"
                    ? "Sign in to continue using Ledgr."
                    : "Create an account to save your data and pick up where you left off."}
                </p>
              </div>
            </div>

            <div className="segmented-toggle">
              <button
                type="button"
                className={`segment-button ${mode === "sign-in" ? "active" : ""}`}
                onClick={() => setMode("sign-in")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`segment-button ${mode === "sign-up" ? "active" : ""}`}
                onClick={() => setMode("sign-up")}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              {mode === "sign-up" ? (
                <label className="field">
                  <span className="field-label">Name</span>
                  <input
                    className="field-input"
                    value={formState.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    placeholder="Your name"
                  />
                </label>
              ) : null}

              <label className="field">
                <span className="field-label">Email</span>
                <input
                  className="field-input"
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className="field">
                <span className="field-label">Password</span>
                <input
                  className="field-input"
                  type="password"
                  value={formState.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>

              {status.message ? (
                <div className={`status-banner ${status.type === "error" ? "error" : "success"}`}>{status.message}</div>
              ) : null}

              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthScreen;
