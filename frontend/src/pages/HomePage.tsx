import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService, type Product } from "../services/product";
import { categoryService, type Category } from "../services/category";
import { ProductCardSkeleton } from "../components/ui/Skeleton";
import ProductCard from "../components/ProductCard";
import Button from "../components/ui/Button";
import Rating from "../components/ui/Rating";

const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  Electronics: { icon: "🖥️", color: "from-blue-400 to-blue-600" },
  Fashion: { icon: "👗", color: "from-purple-400 to-purple-600" },
  Beauty: { icon: "💄", color: "from-pink-400 to-pink-600" },
  "Home & Kitchen": { icon: "🏠", color: "from-green-400 to-green-600" },
  Groceries: { icon: "🛒", color: "from-teal-400 to-teal-600" },
  Sports: { icon: "⚽", color: "from-amber-400 to-amber-600" },
  Accessories: { icon: "⌚", color: "from-indigo-400 to-indigo-600" },
  Books: { icon: "📚", color: "from-red-400 to-red-600" },
};

const DEFAULT_STYLE = { icon: "📦", color: "from-gray-400 to-gray-600" };

const FEATURES = [
  {
    title: "Free Shipping",
    desc: "On orders over $50",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: "Easy Returns",
    desc: "30-day return policy",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    desc: "256-bit SSL encrypted",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    desc: "Dedicated customer service",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const REVIEWS = [
  { name: "Sarah M.", rating: 5, text: "Amazing quality! The products exceeded my expectations. Fast shipping too." },
  { name: "James K.", rating: 5, text: "Best online shopping experience. The customer service is outstanding." },
  { name: "Emily R.", rating: 4, text: "Great selection and competitive prices. Will definitely shop again." },
  { name: "Michael T.", rating: 5, text: "Premium products at affordable prices. Highly recommended!" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productService.list({ per_page: 8 }).then((res) => setFeatured(res.items)).catch(() => {}).finally(() => setLoading(false));
    categoryService.listActive().then(setCategories).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-36 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                New Season Arrivals
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                Discover Premium{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                  Products
                </span>
              </h1>
              <p className="text-lg md:text-xl text-primary-200 mb-8 leading-relaxed max-w-lg">
                Shop the latest trends with confidence. Free shipping on all orders, easy returns, and exceptional quality guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button variant="secondary" size="lg" className="shadow-xl shadow-primary-900/30 text-base px-8 border-primary-600 dark:border-white/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Shop Now
                  </Button>
                </Link>
                <Link to="/shop">
                  <button className="px-8 py-3 border-2 border-white/30 dark:border-white/20 text-white text-base font-semibold rounded-lg hover:bg-white/10 transition-all duration-200">
                    View Categories
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">10k+</p>
                  <p className="text-xs text-primary-200">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-primary-200">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">99%</p>
                  <p className="text-xs text-primary-200">Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-cyan-400/20 rounded-full blur-3xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-white text-lg font-semibold">Premium Quality</p>
                    <p className="text-primary-200 text-sm mt-1">Shop with confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{f.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => {
              const style = CATEGORY_STYLES[cat.name] || DEFAULT_STYLE;
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="text-4xl mb-3">{style.icon}</div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cat.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Featured</span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">Featured Products</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/shop">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-200 dark:text-primary-300 text-sm font-semibold uppercase tracking-wider">Limited Time Offer</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Summer Sale — Up to 40% Off</h2>
          <p className="text-primary-100 dark:text-primary-200 max-w-xl mx-auto mb-8">
            Don't miss out on exclusive deals. Free shipping on all orders.
          </p>
          <Link to="/shop">
            <Button variant="secondary" size="lg" className="shadow-xl text-base px-10 border-primary-600 dark:border-white/30">
              Shop the Sale
            </Button>
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <Rating value={r.rating} size="sm" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 text-xs font-bold">{r.name[0]}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 mb-6">
                The Best Shopping Experience
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Premium Quality", desc: "We handpick every product to ensure the highest quality standards." },
                  { title: "Fast & Free Shipping", desc: "Free shipping on all orders over $50 with delivery within 3-5 business days." },
                  { title: "Hassle-Free Returns", desc: "Not satisfied? Return any item within 30 days for a full refund." },
                  { title: "24/7 Customer Support", desc: "Our dedicated team is here to help you anytime, anywhere." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {["🚚", "🛡️", "⭐", "💬"].map((emoji, i) => (
                    <div key={i} className="bg-white dark:bg-gray-700 rounded-2xl p-6 text-center shadow-sm">
                      <div className="text-4xl mb-2">{emoji}</div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {["Free Shipping", "Secure", "Top Rated", "Support"][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
