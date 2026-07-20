import Link from "next/link";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { CartButton } from "@/components/layout/cart-button";
import { SearchBar } from "@/components/layout/search-bar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { buttonVariants } from "@/components/ui/button";

export async function Navbar() {
  const [categories, session] = await Promise.all([getCategories(), auth()]);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-heading text-xl font-semibold text-primary shrink-0">
          Village Fresh
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="whitespace-nowrap text-sm font-medium text-foreground/80 hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchBar />
          {session?.user ? (
            <>
              <Link
                href="/account/orders"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                aria-label="My orders"
              >
                <User className="size-5" />
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
