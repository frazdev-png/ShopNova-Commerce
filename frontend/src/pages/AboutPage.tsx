export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">About Us</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          Smart Shopping, Better Living
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
          SHOPNOVA is your premium ecommerce destination — built for modern shoppers who demand quality, value, and speed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Our Mission</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We exist to make premium products accessible to everyone. By partnering directly with top manufacturers and cutting out middlemen, we deliver exceptional quality at prices that won't break the bank.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Trust & Safety</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Every transaction is secured with 256-bit SSL encryption. Your data and privacy are our top priority. Shop with confidence knowing we've got your back.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-8 mb-12">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: "10k+", label: "Happy Customers" },
            { value: "500+", label: "Products" },
            { value: "99%", label: "Satisfaction Rate" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Shop With Us?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Free Shipping", desc: "On orders over $50" },
            { title: "Easy Returns", desc: "30-day return policy" },
            { title: "24/7 Support", desc: "We're here to help" },
            { title: "Secure Checkout", desc: "256-bit encrypted" },
          ].map((f) => (
            <div key={f.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{f.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
