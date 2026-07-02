import { Link } from "react-router-dom";

const SHOP_LINKS = [
  { label: "Electronics", path: "/shop?category=Electronics" },
  { label: "Fashion", path: "/shop?category=Fashion" },
  { label: "Beauty", path: "/shop?category=Beauty" },
  { label: "Home & Kitchen", path: "/shop?category=Home%20%26%20Kitchen" },
  { label: "Groceries", path: "/shop?category=Groceries" },
  { label: "Sports", path: "/shop?category=Sports" },
  { label: "Accessories", path: "/shop?category=Accessories" },
  { label: "Books", path: "/shop?category=Books" },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="relative py-14 border-b border-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-primary-800/20 to-transparent" />
          <div className="max-w-2xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600/20 rounded-2xl mb-5 ring-1 ring-primary-500/30">
              <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Stay in the loop</h3>
            <p className="text-sm text-gray-400 mb-7 max-w-md mx-auto leading-relaxed">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-3 max-w-lg mx-auto"
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-5 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-gray-800 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40 flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-white">SHOPNOVA</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Smart Shopping, Better Living. Your premium destination for quality products at unbeatable prices.
            </p>
            <div className="flex gap-3">
              {[
                { name: "Facebook", path: "#" },
                { name: "Twitter", path: "#" },
                { name: "Instagram", path: "#" },
                { name: "YouTube", path: "#" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.path}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  aria-label={s.name}
                >
                  <span className="text-xs font-bold">{s.name[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/support-chat" className="text-gray-400 hover:text-white transition-colors">Live Chat</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SHOPNOVA. All rights reserved. Smart Shopping, Better Living.</p>
          <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
