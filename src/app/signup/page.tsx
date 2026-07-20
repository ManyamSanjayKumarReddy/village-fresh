import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-center">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Takes a minute — you&apos;ll need this to check out and track orders.
        </p>
        <div className="mt-8">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
