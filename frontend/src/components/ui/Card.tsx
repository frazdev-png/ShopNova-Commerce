interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({ children, className = "", hover = false, padding = "md" }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
