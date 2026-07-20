import Link from "next/link";
import { AuthModal } from "@/components/auth/auth-modal";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupModal() {
  return (
    <AuthModal
      title="Create your account"
      description="Takes a minute — you'll need this to check out and track orders."
    >
      <SignupForm />
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthModal>
  );
}
