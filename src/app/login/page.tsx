import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-center">
          Sign in to continue
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Just for checkout and order history — browsing never needs an account.
        </p>
        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
