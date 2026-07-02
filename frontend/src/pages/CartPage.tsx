import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { CartIcon, XIcon } from "../components/ui/Icons";
import { useCart } from "../store";
import { useToast } from "../store";

export default function CartPage() {
  const toast = useToast();
  const { items, count, total, loading, refresh, updateItem, removeItem } = useCart();
  const [orderLoading, setOrderLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateItem(itemId, qty);
    } catch (err: any) {
      toast.showError(err.message || "Failed to update");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.showSuccess("Item removed from cart");
    } catch (err: any) {
      toast.showError(err.message || "Failed to remove");
    }
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      setCouponApplied(true);
      toast.showSuccess("Coupon applied! 10% discount");
    } else {
      toast.showError("Invalid coupon code");
    }
  };

  const discount = couponApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<CartIcon className="w-16 h-16 text-gray-300" />}
          title="Your cart is empty"
          description="Looks like you haven't added any items yet. Start shopping to fill it up!"
          action={{ label: "Browse Products", onClick: () => window.location.href = "/shop" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count} item{count !== 1 ? "s" : ""} in your cart</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="flex gap-4 p-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-50 to-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                    {item.title}
                  </Link>
                  <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">${item.price.toFixed(2)} each</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors rounded-l-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors rounded-r-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {couponApplied ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coupon "SAVE10" applied!
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button variant="secondary" size="sm" onClick={applyCoupon}>Apply</Button>
                </div>
              )}
            </div>

            <Link to="/checkout">
              <Button size="lg" className="w-full mt-6" loading={orderLoading}>
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              to="/shop"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium"
            >
              Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
