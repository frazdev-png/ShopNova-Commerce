type BadgeVariant = "primary" | "success" | "warning" | "danger" | "gray" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  outline: "bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
};

const sizes: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({ children, variant = "primary", size = "md", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
