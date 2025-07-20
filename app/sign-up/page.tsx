import { SignUpForm } from "@/components/sign-up-form";
import { Suspense } from "react";

function SignUpContent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignUpForm />
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm md:max-w-3xl bg-muted animate-pulse rounded-lg h-96"></div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
