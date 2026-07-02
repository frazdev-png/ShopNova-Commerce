import { useEffect, useState } from "react";
import { orderService, type Order } from "../../services/order";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../store";

const ALL_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    orderService.all(1, 100)
      .then((r) => setOrders(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.showSuccess(`Order status updated to ${newStatus}`);
      setSelectedOrder(null);
    } catch (err: any) {
      toast.showError(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No orders yet</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-semibold">Order ID</th>
                  <th className="text-left px-6 py-4 font-semibold">Customer</th>
                  <th className="text-left px-6 py-4 font-semibold">Items</th>
                  <th className="text-left px-6 py-4 font-semibold">Total</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {order.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {order.items.length}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_COLORS[order.status] || "gray"} size="sm">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Status update modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.id.slice(0, 8) || ""}`}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Current status:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => selectedOrder && handleStatusChange(selectedOrder.id, status)}
                disabled={status === selectedOrder?.status || updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === selectedOrder?.status
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          {updating && <Spinner size="sm" />}
        </div>
      </Modal>
    </div>
  );
}
