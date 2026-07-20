"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden w-full max-w-xs md:block">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search podis, pickles, snacks..."
        className="pl-8"
      />
    </form>
  );
}
