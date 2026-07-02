import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store";
import { orderService, type Order } from "../services/order";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { LogoutIcon } from "../components/ui/Icons";

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "danger" | "gray"> = {
  pending: "warning",
  confirmed: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.my(1, 5)
      .then((r) => setOrders(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const joinedDate = useMemo(
    () => (user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""),
    [user?.created_at],
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="xl" />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-primary-100 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === "admin" ? "primary" : "success"} size="sm" className="bg-white/20 text-white">
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </Badge>
                <span className="text-xs text-primary-200">Joined {joinedDate}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <LogoutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Browse Shop", path: "/shop", icon: "🛍️" },
          { label: "Shopping Cart", path: "/cart", icon: "🛒" },
          { label: "Wishlist", path: "/wishlist", icon: "❤️" },
          ...(user.role === "admin" ? [{ label: "Admin Panel", path: "/admin", icon: "⚙️" }] : [{ label: "Support", path: "/support-chat", icon: "💬" }]),
        ].map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-1">{link.icon}</div>
            <p className="text-xs font-medium text-gray-700">{link.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500">Your latest purchases</p>
          </div>
          {orders.length > 0 && (
            <Link to="/orders" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">View All</Link>
          )}
        </div>

        {loading ? (
          <Spinner className="py-8" />
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start shopping to see your orders here.</p>
            <Link to="/shop"><Button variant="outline" className="mt-4">Browse Products</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()} &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">${order.total_price.toFixed(2)}</span>
                  <Badge variant={STATUS_COLORS[order.status] || "gray"} size="sm">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
