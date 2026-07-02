import { Navigate } from "react-router-dom";
import { useAuth } from "../store";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {user && <ChatWidget />}
    </div>
  );
};

export default Layout;
