"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewAddress = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

const EMPTY_ADDRESS: NewAddress = {
  label: "",
  line1: "",
  line2: "",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "",
  phone: "",
};

export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (addressId: number) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<NewAddress>(EMPTY_ADDRESS);

  const mutation = useMutation({
    mutationFn: async (input: NewAddress) => {
      const res = await fetch("/api/v1/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, isDefault: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Could not save address.");
      return body.address as { id: number };
    },
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onSaved(address.id);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function set<K extends keyof NewAddress>(key: K, value: NewAddress[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Label (optional)</Label>
        <Input
          id="label"
          placeholder="Home, Office..."
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="line1">Address line 1</Label>
        <Input
          id="line1"
          required
          value={form.line1}
          onChange={(e) => set("line1", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="line2">Address line 2 (optional)</Label>
        <Input id="line2" value={form.line2} onChange={(e) => set("line2", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            required
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            required
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
