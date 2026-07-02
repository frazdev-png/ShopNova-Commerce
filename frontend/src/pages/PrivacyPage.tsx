export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Legal</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: January 2025</p>
      </div>

      <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, shipping address, and payment information when you create an account or place an order. We also automatically collect certain technical data such as IP address, browser type, and device information to improve our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
          <p>Your information is used to process orders, communicate with you about your purchases, send promotional offers (with your consent), improve our platform, and prevent fraud. We never sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">3. Data Security</h2>
          <p>We implement industry-standard 256-bit SSL encryption, secure servers, and regular security audits to protect your personal information. Payment data is processed directly by PCI-compliant payment gateways and never stored on our servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">4. Cookies</h2>
          <p>We use essential cookies for site functionality and analytics cookies to understand how you interact with our store. You can control cookie preferences through your browser settings. Disabling certain cookies may affect site performance.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You can manage your preferences through your account settings or contact us at privacy@shopnova.com for assistance.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">6. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please reach out to our Data Protection Team at privacy@shopnova.com or write to us at: SHOPNOVA, 123 Commerce Street, San Francisco, CA 94102.</p>
        </section>
      </div>
    </div>
  );
}
