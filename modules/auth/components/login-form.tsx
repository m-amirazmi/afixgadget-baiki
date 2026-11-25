"use client";

import { useState, type FormEvent } from "react";

import { authClient } from "../client/auth-client";

type LoginFormProps = {
  googleEnabled: boolean;
};

type Mode = "sign-in" | "sign-up";

export function LoginForm({ googleEnabled }: LoginFormProps) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ name, email, password });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Authentication failed.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/login",
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Google sign-in failed.");
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setErrorMessage(result.error.message ?? "Sign-out failed.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Sign-out failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSessionPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Checking your session…
        </p>
      </main>
    );
  }

  if (session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            AfixGadget
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
            You’re signed in
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as {session.user.name} ({session.user.email}).
          </p>
          {errorMessage && (
            <p
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
          <button
            className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            disabled={isSubmitting}
            onClick={handleSignOut}
            type="button"
          >
            {isSubmitting ? "Signing out…" : "Sign out"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          AfixGadget
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "sign-in"
            ? "Sign in to test your account."
            : "Create an account to try email and password authentication."}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <label className="block space-y-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Name
              <input
                autoComplete="name"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          )}

          <label className="block space-y-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Email
            <input
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Password
            <input
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              maxLength={128}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {errorMessage && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {googleEnabled ? (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-xs text-zinc-500">OR</span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <button
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              type="button"
            >
              Continue with Google
            </button>
          </>
        ) : (
          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Add Google OAuth credentials to your local environment to enable
            Google sign-in.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "sign-in" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setErrorMessage(null);
            }}
            type="button"
          >
            {mode === "sign-in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}
