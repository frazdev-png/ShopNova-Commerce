export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Support</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">Shipping Information</h1>
        <p className="text-gray-500 dark:text-gray-400">Everything you need to know about delivery with SHOPNOVA.</p>
      </div>

      <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Shipping Options & Rates</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <th className="text-left px-4 py-3 font-semibold">Method</th>
                  <th className="text-left px-4 py-3 font-semibold">Delivery Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ["Standard", "5–7 business days", "Free over $50 / $5.99"],
                  ["Express", "2–3 business days", "$14.99"],
                  ["Next Day", "1 business day", "$24.99"],
                ].map((row) => (
                  <tr key={row[0]} className="text-gray-600 dark:text-gray-300">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Processing Time</h2>
          <p>Orders are processed within 1–2 business days after payment confirmation. You'll receive a tracking number via email once your order ships. Orders placed on weekends or holidays are processed the next business day.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Free Shipping</h2>
          <p>Enjoy free standard shipping on all orders over $50. The discount is automatically applied at checkout. No coupon code needed.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Tracking Your Order</h2>
          <p>Once your order ships, you'll receive an email with a tracking link. You can also view your order status anytime from your account dashboard under "My Orders".</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Shipping Areas</h2>
          <p>We currently ship to all 50 US states and Canada. Some remote areas may experience longer delivery times. International shipping is not yet available but coming soon.</p>
        </section>
      </div>
    </div>
  );
}
