export function VegIndicator({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={`flex size-4 items-center justify-center rounded-[3px] border-2 bg-white ${
        isVeg ? "border-green-600" : "border-red-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isVeg ? "bg-green-600" : "bg-red-700"}`}
      />
    </span>
  );
}
