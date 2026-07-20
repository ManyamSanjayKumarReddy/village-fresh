import { desc } from "drizzle-orm";
import { Tag } from "lucide-react";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { CouponToggle } from "@/components/admin/coupon-toggle";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const items = await db.select().from(coupons).orderBy(desc(coupons.id));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Offers &amp; coupons</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create festive sales and discount codes customers can apply at checkout.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {items.length === 0 ? "No coupons yet." : "Existing coupons"}
          </p>
          <div className="flex flex-col gap-3">
            {items.map((coupon) => {
              const now = new Date();
              const expired = coupon.endsAt && now > new Date(coupon.endsAt);
              const notStarted = coupon.startsAt && now < new Date(coupon.startsAt);

              return (
                <div key={coupon.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                          <Tag className="size-3" />
                          {coupon.code}
                        </span>
                        {expired && (
                          <span className="text-xs font-medium text-destructive">Expired</span>
                        )}
                        {notStarted && (
                          <span className="text-xs font-medium text-muted-foreground">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-medium">{coupon.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% off`
                          : `${formatPaise(coupon.discountValue)} off`}
                        {coupon.discountType === "percentage" && coupon.maxDiscountPaise
                          ? ` (up to ${formatPaise(coupon.maxDiscountPaise)})`
                          : ""}
                        {coupon.minOrderSubtotalPaise > 0
                          ? ` · min order ${formatPaise(coupon.minOrderSubtotalPaise)}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Used {coupon.timesRedeemed}
                        {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""} times
                        {coupon.startsAt || coupon.endsAt ? " · " : ""}
                        {coupon.startsAt &&
                          `From ${new Date(coupon.startsAt).toLocaleDateString("en-IN")}`}
                        {coupon.startsAt && coupon.endsAt && " "}
                        {coupon.endsAt &&
                          `Until ${new Date(coupon.endsAt).toLocaleDateString("en-IN")}`}
                      </p>
                    </div>
                    <CouponToggle couponId={coupon.id} value={coupon.isActive} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">Create a coupon</p>
          <NewCouponForm />
        </div>
      </div>
    </div>
  );
}
