"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import { authClient } from "../../auth/client/auth-client";
import { ThemeSwitcher } from "./theme-switcher";

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
        callbackURL: "/example/login",
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
      <LoginShell>
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Checking your session…
          </CardContent>
        </Card>
      </LoginShell>
    );
  }

  if (session?.user) {
    return (
      <LoginShell>
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardHeader>
            <Brand />
            <CardTitle className="mt-4 text-2xl">You’re signed in</CardTitle>
            <CardDescription>
              Signed in as {session.user.name} ({session.user.email}).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {errorMessage && <ErrorMessage message={errorMessage} />}
            <Button
              className="h-12 w-full"
              disabled={isSubmitting}
              onClick={handleSignOut}
              type="button"
              variant="outline"
            >
              {isSubmitting ? "Signing out…" : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="gap-4">
          <Brand />
          <div className="grid gap-2">
            <CardTitle className="text-2xl">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "sign-in"
                ? "Sign in to your Afix Gadget account."
                : "Create an account to continue."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <label className="grid gap-2 text-sm font-medium">
                Name
                <Input
                  autoComplete="name"
                  className="h-12"
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
            )}

            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input
                autoComplete="email"
                className="h-12"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Password
              <Input
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                className="h-12"
                maxLength={128}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            {errorMessage && <ErrorMessage message={errorMessage} />}

            <Button
              className="mt-1 h-12 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
              {!isSubmitting && <ArrowRight aria-hidden="true" />}
            </Button>
          </form>

          {googleEnabled ? (
            <>
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>
              <Button
                className="h-12 w-full"
                disabled={isSubmitting}
                onClick={handleGoogleSignIn}
                type="button"
                variant="outline"
              >
                <span className="font-bold" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </Button>
            </>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Google sign-in is unavailable until OAuth credentials are set.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "sign-in" ? "New here?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4"
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setErrorMessage(null);
              }}
              type="button"
            >
              {mode === "sign-in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </LoginShell>
  );
}

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      {children}
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Wrench className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-heading text-sm font-bold tracking-wide">
          AFIX GADGET
        </p>
        <p className="text-xs text-muted-foreground">Repair & mobile specialist</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}
