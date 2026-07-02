import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminDashboardService, type DashboardStats } from "../../services/adminDashboard";
import { orderService, type Order } from "../../services/order";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const STAT_ICONS: Record<string, string> = {
  total_products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  active_products: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  total_customers: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  total_orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  total_revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  pending_orders: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminDashboardService.getStats(),
      orderService.all(1, 5),
    ]).then(([s, o]) => {
      setStats(s);
      setOrders(o.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!stats) return <p className="text-gray-500 text-center py-20">Failed to load dashboard</p>;

  const statCards = [
    { label: "Total Products", value: stats.total_products, color: "from-blue-400 to-blue-600", key: "total_products" },
    { label: "Active Products", value: stats.active_products, color: "from-green-400 to-green-600", key: "active_products" },
    { label: "Total Customers", value: stats.total_customers, color: "from-purple-400 to-purple-600", key: "total_customers" },
    { label: "Total Orders", value: stats.total_orders, color: "from-amber-400 to-amber-600", key: "total_orders" },
    { label: "Revenue", value: `$${stats.total_revenue.toFixed(0)}`, color: "from-cyan-400 to-cyan-600", key: "total_revenue" },
    { label: "Pending Orders", value: stats.pending_orders, color: "from-rose-400 to-rose-600", key: "pending_orders" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.key} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={STAT_ICONS[s.key] || STAT_ICONS.total_products} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Add Product", path: "/admin/products/create", icon: "M12 4v16m8-8H4" },
          { label: "View Orders", path: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
          { label: "Manage Categories", path: "/admin/categories", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" },
          { label: "View Store", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest customer orders</p>
          </div>
          {orders.length > 0 && (
            <Link to="/admin/orders" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">
              View All
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 text-gray-900 dark:text-gray-100 font-medium">#{o.id.slice(0, 8)}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-gray-900 dark:text-gray-100 font-medium">${o.total_price.toFixed(2)}</td>
                    <td className="py-3">
                      <Badge variant={STATUS_COLORS[o.status] || "gray"} size="sm">
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
