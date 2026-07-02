import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer";
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "customer" && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
