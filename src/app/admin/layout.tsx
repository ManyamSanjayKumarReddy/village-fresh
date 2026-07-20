import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/admin/orders" className="font-heading text-lg font-semibold text-primary">
            Village Fresh Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/orders" className="text-foreground/80 hover:text-primary">
              Orders
            </Link>
            <Link href="/admin/products" className="text-foreground/80 hover:text-primary">
              Products
            </Link>
            <Link href="/admin/categories" className="text-foreground/80 hover:text-primary">
              Categories
            </Link>
            <Link href="/admin/pincodes" className="text-foreground/80 hover:text-primary">
              Pincodes
            </Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-muted-foreground hover:text-primary">
            Back to store
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
