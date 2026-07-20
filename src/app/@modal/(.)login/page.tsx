import { Suspense } from "react";
import Link from "next/link";
import { AuthModal } from "@/components/auth/auth-modal";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginModal() {
  return (
    <AuthModal
      title="Sign in to continue"
      description="Just for checkout and order history — browsing never needs an account."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthModal>
  );
}
