import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/mail" signUpFallbackRedirectUrl="/mail" />
    </div>
  );
}
