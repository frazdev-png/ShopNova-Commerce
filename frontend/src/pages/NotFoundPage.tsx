import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-100 dark:text-primary-900 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/"><Button>Go Home</Button></Link>
          <Link to="/shop"><Button variant="outline">Browse Shop</Button></Link>
        </div>
      </div>
    </div>
  );
}
