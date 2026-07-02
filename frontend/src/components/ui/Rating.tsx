import { StarIcon, StarOutlineIcon } from "./Icons";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

const iconSizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4" };

export default function Rating({ value, max = 5, size = "sm", showValue }: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) =>
        i < Math.round(value) ? (
          <StarIcon key={i} className={`${iconSizes[size]} text-amber-400`} />
        ) : (
          <StarOutlineIcon key={i} className={`${iconSizes[size]} text-gray-300`} />
        ),
      )}
      {showValue && <span className="text-xs text-gray-500 ml-1">({value})</span>}
    </div>
  );
}
