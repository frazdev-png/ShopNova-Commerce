import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderService, type Order } from "../services/order";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "danger" | "gray"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    orderService.my(page, perPage)
      .then((r) => { setOrders(r.items); setTotal(r.total); setTotalPages(Math.max(1, Math.ceil(r.total / perPage))); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const getStatusIndex = (status: string) => STATUS_STEPS.indexOf(status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} order{total !== 1 ? "s" : ""} total</p>
        </div>
        <Link to="/shop" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Continue Shopping</Link>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState title="No orders yet" description="Start shopping to see your orders here."
            action={{ label: "Browse Products", onClick: () => window.location.href = "/shop" }} />
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentIdx = getStatusIndex(order.status);
            const isCancelled = order.status === "cancelled";
            return (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link to={`/order/${order.id}`} className="text-sm font-mono text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      #{order.id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${order.total_price.toFixed(2)}</p>
                    <Badge variant={STATUS_COLORS[order.status] || "gray"} size="sm">{order.status.toUpperCase()}</Badge>
                  </div>
                </div>

                {/* Status timeline */}
                {!isCancelled ? (
                  <div className="flex items-center gap-1 mb-4">
                    {STATUS_STEPS.map((s, i) => {
                      const done = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            done ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          } ${isCurrent ? "ring-2 ring-primary-300" : ""}`}>
                            {done ? "✓" : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-red-500 font-medium mb-4">Order Cancelled</div>
                )}

                <div className="text-xs text-gray-400 dark:text-gray-500 flex gap-2">
                  {order.payment_method && <span>Payment: {order.payment_method.toUpperCase()}</span>}
                  <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                </div>
              </Card>
            );
          })}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
