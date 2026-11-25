import { LoginForm } from "@/modules/example/components/login-form";

export default function ExampleLoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return <LoginForm googleEnabled={googleEnabled} />;
}
