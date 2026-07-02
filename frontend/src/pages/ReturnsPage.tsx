export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Support</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">Returns & Exchanges</h1>
        <p className="text-gray-500 dark:text-gray-400">Hassle-free returns within 30 days. We make it easy.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {[
          { step: "1", title: "Initiate Return", desc: "Log into your account and select the order you'd like to return." },
          { step: "2", title: "Ship It Back", desc: "Pack the items securely and ship them to our returns center." },
          { step: "3", title: "Get Refunded", desc: "Refunds are processed within 5–7 business days of receipt." },
        ].map((s) => (
          <div key={s.step} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 dark:text-primary-400 font-bold">{s.step}</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{s.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Return Policy</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Items must be returned within 30 days of delivery</li>
            <li>Products must be unused and in original packaging</li>
            <li>Clearance items and digital products are non-returnable</li>
            <li>Return shipping is free for defective or incorrect items</li>
            <li>Customers cover return shipping for change-of-mind returns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Refund Timeline</h2>
          <p>Once we receive your return, please allow 5–7 business days for the refund to be processed. The amount will be credited to your original payment method. You'll receive an email confirmation when the refund is issued.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Exchanges</h2>
          <p>We currently do not offer direct exchanges. If you need a different size or color, please initiate a return and place a new order. This ensures you get the correct item as quickly as possible.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Need Help?</h2>
          <p>Contact our support team at <span className="text-primary-600 dark:text-primary-400">returns@shopnova.com</span> or use the live chat widget for assistance with your return.</p>
        </section>
      </div>
    </div>
  );
}
