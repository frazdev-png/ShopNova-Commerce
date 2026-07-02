import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Contact</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">Get in Touch</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Have a question, concern, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Email", value: "support@shopnova.com", icon: "✉️" },
          { label: "Phone", value: "+1 (555) 123-4567", icon: "📞" },
          { label: "Hours", value: "Mon–Fri, 9AM–6PM EST", icon: "🕐" },
        ].map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <span className="text-2xl">{c.icon}</span>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mt-2">{c.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        {sent ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h3>
            <p className="text-gray-500 dark:text-gray-400">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Your Name" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input required type="email" placeholder="Your Email" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <input placeholder="Subject" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <textarea rows={5} required placeholder="Your Message" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
