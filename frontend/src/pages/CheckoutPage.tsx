import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shippingService, type ShippingAddress } from "../services/shipping";
import { orderService } from "../services/order";
import { useCart, useToast } from "../store";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order" },
  { value: "bank_transfer", label: "Bank Transfer", desc: "Pay via bank transfer" },
  { value: "stripe", label: "Credit Card (Stripe)", desc: "Pay securely with credit card" },
  { value: "paypal", label: "PayPal", desc: "Pay with your PayPal account" },
];

interface ShippingForm {
  full_name: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address_line: string;
  postal_code: string;
  notes: string;
}

const emptyForm: ShippingForm = {
  full_name: "",
  phone: "",
  email: "",
  country: "",
  city: "",
  address_line: "",
  postal_code: "",
  notes: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, total, loading: cartLoading, refresh } = useCart();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [shippingForm, setShippingForm] = useState<ShippingForm>(emptyForm);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<ShippingForm>>({});
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);

  useEffect(() => {
    shippingService.list()
      .then((addrs) => {
        setAddresses(addrs);
        if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, []);

  useEffect(() => {
    if (!cartLoading && items.length === 0 && !submitting) {
      navigate("/cart");
    }
  }, [items, cartLoading, navigate, submitting]);

  const validateShipping = (): boolean => {
    const errs: Partial<ShippingForm> = {};
    if (!shippingForm.full_name.trim()) errs.full_name = "Full name is required";
    if (!shippingForm.phone.trim()) errs.phone = "Phone is required";
    if (!shippingForm.email.trim()) errs.email = "Email is required";
    if (!shippingForm.country.trim()) errs.country = "Country is required";
    if (!shippingForm.city.trim()) errs.city = "City is required";
    if (!shippingForm.address_line.trim()) errs.address_line = "Address is required";
    if (!shippingForm.postal_code.trim()) errs.postal_code = "Postal code is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedAddressId) {
        const addr = addresses.find((a) => a.id === selectedAddressId);
        if (addr) {
          setShippingForm({
            full_name: addr.full_name,
            phone: addr.phone,
            email: addr.email,
            country: addr.country,
            city: addr.city,
            address_line: addr.address_line,
            postal_code: addr.postal_code,
            notes: "",
          });
        }
        setStep(2);
        return;
      }
      if (!validateShipping()) return;
      setStep(2);
    } else if (step === 2) {
      if (!selectedPayment) { toast.showError("Please select a payment method"); return; }
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      let addressId = selectedAddressId;

      // Save new address if needed
      if (!addressId) {
        const newAddr = await shippingService.create({
          full_name: shippingForm.full_name,
          phone: shippingForm.phone,
          email: shippingForm.email,
          country: shippingForm.country,
          city: shippingForm.city,
          address_line: shippingForm.address_line,
          postal_code: shippingForm.postal_code,
          is_default: addresses.length === 0,
        });
        addressId = newAddr.id;
      }

      const order = await orderService.create({
        shipping_address_id: addressId,
        payment_method: selectedPayment,
        notes: shippingForm.notes || undefined,
      });

      toast.showSuccess("Order placed successfully!");
      await refresh();
      navigate(`/my-orders`);
    } catch (err: any) {
      toast.showError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) return <Spinner size="lg" className="py-20" />;
  if (items.length === 0) return null;

  const subtotal = total;
  const shippingFee = subtotal >= 50 ? 0 : 9.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const finalTotal = parseFloat((subtotal + shippingFee + tax).toFixed(2));

  const handleFormChange = (field: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: "Shipping" },
          { num: 2, label: "Payment" },
          { num: 3, label: "Review" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= s.num ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}>{s.num}</div>
            <span className={`text-sm font-medium ${step >= s.num ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</span>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Shipping Information</h2>

              {addresses.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Saved Addresses</label>
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id === selectedAddressId ? "" : addr.id)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">{addr.full_name}</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">{addr.address_line}, {addr.city}, {addr.country}</p>
                        <p className="text-gray-500 dark:text-gray-400">{addr.phone} | {addr.email}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button onClick={() => setSelectedAddressId("")} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      + Add new address
                    </button>
                  </div>
                </div>
              )}

              {!selectedAddressId && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name *" value={shippingForm.full_name} onChange={handleFormChange("full_name")}
                      error={formErrors.full_name} placeholder="John Doe" />
                    <Input label="Phone Number *" value={shippingForm.phone} onChange={handleFormChange("phone")}
                      error={formErrors.phone} placeholder="+1 234 567 890" />
                  </div>
                  <Input label="Email *" type="email" value={shippingForm.email} onChange={handleFormChange("email")}
                    error={formErrors.email} placeholder="john@example.com" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Country *" value={shippingForm.country} onChange={handleFormChange("country")}
                      error={formErrors.country} placeholder="United States" />
                    <Input label="City *" value={shippingForm.city} onChange={handleFormChange("city")}
                      error={formErrors.city} placeholder="New York" />
                  </div>
                  <Input label="Address Line *" value={shippingForm.address_line} onChange={handleFormChange("address_line")}
                    error={formErrors.address_line} placeholder="123 Main St, Apt 4B" />
                  <Input label="Postal Code *" value={shippingForm.postal_code} onChange={handleFormChange("postal_code")}
                    error={formErrors.postal_code} placeholder="10001" />
                  <Input label="Order Notes (optional)" value={shippingForm.notes} onChange={handleFormChange("notes")}
                    placeholder="Delivery instructions, gate code, etc." />
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    Save this address for future orders
                  </label>
                </div>
              )}
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setSelectedPayment(pm.value)}
                    className={`w-full text-left p-4 rounded-lg border text-sm transition-colors ${
                      selectedPayment === pm.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">{pm.label}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">{pm.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Review Your Order</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shipping To</h3>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{shippingForm.full_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{shippingForm.address_line}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{shippingForm.city}, {shippingForm.country} {shippingForm.postal_code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{shippingForm.phone} | {shippingForm.email}</p>
                </div>
                {shippingForm.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shippingForm.notes}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{PAYMENT_METHODS.find((p) => p.value === selectedPayment)?.label}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.title} × {item.quantity}</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>Continue</Button>
            ) : (
              <Button onClick={handlePlaceOrder} loading={submitting} size="lg">
                Place Order — ${finalTotal.toFixed(2)}
              </Button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{item.title} × {item.quantity}</span>
                  <span className="text-gray-900 dark:text-gray-100">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                  {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold text-gray-900 dark:text-gray-100 text-base">
                <span>Total</span><span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
