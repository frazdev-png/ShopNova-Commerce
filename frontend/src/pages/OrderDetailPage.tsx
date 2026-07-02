import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService, type Order } from "../services/order";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "danger" | "gray"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService.get(id)
      .then(setOrder)
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">{error || "Order not found"}</p>
        <Link to="/my-orders" className="text-primary-600 hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/my-orders" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <Badge variant={STATUS_COLORS[order.status] || "gray"} size="md">
          {(STATUS_LABELS[order.status] || order.status).toUpperCase()}
        </Badge>
      </div>

      {/* Status timeline */}
      <Card className="p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Order Status</h2>
        {!isCancelled ? (
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    } ${isCurrent ? "ring-2 ring-primary-300 ring-offset-2 dark:ring-offset-gray-900" : ""}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${done ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}`}>{STATUS_LABELS[s]}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-6 ${done ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 text-xs font-bold">✕</div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Order Cancelled</span>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Order info */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="text-gray-900 dark:text-gray-100">${order.subtotal?.toFixed(2) || "0.00"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Shipping</span><span className="text-gray-900 dark:text-gray-100">{order.shipping_fee ? `$${order.shipping_fee.toFixed(2)}` : "Free"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tax</span><span className="text-gray-900 dark:text-gray-100">${order.tax?.toFixed(2) || "0.00"}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold text-base">
              <span className="text-gray-900 dark:text-gray-100">Total</span><span className="text-gray-900 dark:text-gray-100">${order.total_price.toFixed(2)}</span>
            </div>
            {order.payment_method && (
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Payment</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{order.payment_method.toUpperCase()}</span>
              </div>
            )}
            {order.notes && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Notes</span>
                <p className="text-gray-900 dark:text-gray-100">{order.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Items */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Items ({order.items.length})</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <Link to={`/product/${item.product_id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400">{item.product_title}</Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${item.price_snapshot.toFixed(2)}</p>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">${(item.quantity * item.price_snapshot).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
