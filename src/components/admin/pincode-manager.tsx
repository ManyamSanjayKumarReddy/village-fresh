"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Pincode = {
  id: number;
  pincode: string;
  city: string;
  isActive: boolean;
};

export function PincodeManager() {
  const queryClient = useQueryClient();
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Chennai");

  const pincodesQuery = useQuery({
    queryKey: ["admin-pincodes"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/pincodes");
      if (!res.ok) throw new Error("Could not load pincodes.");
      const body = await res.json();
      return body.items as Pincode[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, city }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Could not add pincode.");
      return body.pincode as Pincode;
    },
    onSuccess: () => {
      toast.success(`${pincode} added.`);
      setPincode("");
      queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/v1/admin/pincodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Could not update pincode.");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/admin/pincodes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove pincode.");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] }),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {pincodesQuery.data?.length ?? 0} serviceable pincode(s)
        </p>
        <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto">
          {pincodesQuery.data?.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-2"
            >
              <div>
                <span className="font-medium">{p.pincode}</span>
                <span className="ml-2 text-sm text-muted-foreground">{p.city}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={p.isActive}
                    onChange={(e) =>
                      toggleMutation.mutate({ id: p.id, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove pincode"
                  onClick={() => deleteMutation.mutate(p.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Add a pincode</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate();
          }}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              required
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <Button type="submit" disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add pincode"}
          </Button>
        </form>
      </div>
    </div>
  );
}
