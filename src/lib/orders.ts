/**
 * Flat delivery fee placeholder — spec section 9 leaves the real delivery-fee
 * logic (flat vs weight-based vs free-above-threshold) as an open decision.
 */
export const DELIVERY_FEE_PAISE = 4000;

export const FREE_DELIVERY_THRESHOLD_PAISE = 60000;

export function calculateDeliveryFeePaise(subtotalPaise: number): number {
  return subtotalPaise >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_FEE_PAISE;
}
