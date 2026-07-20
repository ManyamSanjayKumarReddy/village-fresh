import { cn } from "@/lib/utils";

export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-2 text-muted-foreground",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className="size-12 opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M24 10h16v6H24z" />
        <path d="M22 16h20l3 6v28a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4V22z" />
        <path d="M18 28h28" />
        <path d="M27 36c0 2 1.5 3 2.5 4s1.5 2 1.5 3-1 2-2.5 2" opacity="0.6" />
      </svg>
      <span className="text-xs font-medium">Photo coming soon</span>
    </div>
  );
}
