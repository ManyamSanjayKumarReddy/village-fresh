import { PincodeManager } from "@/components/admin/pincode-manager";

export default function AdminPincodesPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Serviceable pincodes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Customers can only check out with a delivery address in one of these
        pincodes.
      </p>
      <div className="mt-6">
        <PincodeManager />
      </div>
    </div>
  );
}
