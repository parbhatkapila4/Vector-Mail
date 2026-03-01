import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/auth/set-session" signUpFallbackRedirectUrl="/auth/set-session" />
    </div>
  );
}
