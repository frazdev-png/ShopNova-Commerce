interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ className = "", variant = "text", width, height }: SkeletonProps) {
  const base = "bg-gray-200 animate-pulse rounded";
  const variantClass = variant === "circular" ? "rounded-full" : variant === "text" ? "rounded h-4" : "rounded-lg";

  return (
    <div
      className={`${base} ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-56 sm:h-52 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-end justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
