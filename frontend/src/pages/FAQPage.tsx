import { useState } from "react";

const FAQS = [
  { q: "How do I place an order?", a: "Simply browse our catalog, add items to your cart, and proceed to checkout. You'll need a registered account to complete your purchase." },
  { q: "What payment methods do you accept?", a: "We accept major credit cards (Visa, Mastercard, Amex), bank transfers, PayPal, and Stripe. All payments are processed securely." },
  { q: "Can I change or cancel my order?", a: "You can modify or cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be changed." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5–7 business days. Express shipping (2–3 business days) is available at checkout. Free shipping on orders over $50." },
  { q: "What is your return policy?", a: "We offer a 30-day return policy on most items. Products must be unused and in original packaging. See our Returns page for full details." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also track orders from your account dashboard." },
  { q: "Do you ship internationally?", a: "Currently we ship within the United States and Canada. International shipping is coming soon." },
  { q: "How do I contact support?", a: "You can reach us via the Contact page, email us at support@shopnova.com, or use the live chat widget on our site." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Support</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Everything you need to know about shopping with SHOPNOVA.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              {faq.q}
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
