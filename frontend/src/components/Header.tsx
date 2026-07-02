import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useCart, useWishlist, useTheme } from "../store";
import { categoryService, type Category } from "../services/category";
import {
  SearchIcon,
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  LogoutIcon,
} from "./ui/Icons";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";

export default function Header() {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.listActive().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mobileOpen) setCatOpen(false);
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const navLinks = (
    <>
      <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">Home</Link>
      <Link to="/shop" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">Shop</Link>
      <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
        <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">
          Categories
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </button>
        {catOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-30 animate-in fade-in">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link to="/shop?deals=true" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">Deals</Link>
    </>
  );

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                SHOP<span className="text-primary-600 dark:text-primary-400">NOVA</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks}
            </nav>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs xl:max-w-sm mx-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 focus:border-primary-500 transition-all"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </form>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              <Link
                to="/wishlist"
                className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <HeartIcon className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <CartIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar name={user.name} size="sm" />
                    <span className="hidden xl:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <ChevronDownIcon className="hidden xl:block w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 animate-in fade-in">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <UserIcon className="w-4 h-4" /> My Dashboard
                        </Link>
                        <Link to="/my-orders" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> My Orders
                        </Link>
                        <Link to="/cart" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <CartIcon className="w-4 h-4" /> My Cart
                        </Link>
                        <Link to="/wishlist" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <HeartIcon className="w-4 h-4" /> Wishlist
                        </Link>
                        {user.role === "admin" && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors w-full">
                            <LogoutIcon className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                  <Link to="/register" className="hidden sm:block"><Button size="sm">Sign Up</Button></Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">SHOPNOVA</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}>
                <div className="relative">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">🏠 Home</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                <span className="flex items-center justify-center w-9 h-9 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-lg">🛍️</span>
                <span>Browse Shop</span>
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                <span className="flex items-center justify-center w-9 h-9 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-lg">🛒</span>
                <span className="flex-1">Shopping Cart</span>
                {cartCount > 0 && (
                  <span className="bg-primary-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </Link>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                <span className="flex items-center justify-center w-9 h-9 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-lg">❤️</span>
                <span className="flex-1">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
                )}
              </Link>
              {user && (
                <Link to="/support-chat" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                  <span className="flex items-center justify-center w-9 h-9 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-lg">💬</span>
                  <span>Support</span>
                </Link>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
              <p className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categories</p>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.name)}`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                  {cat.name}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
              <Link to="/shop?deals=true" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all">
                🔥 Hot Deals
              </Link>

              {user && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
                  <p className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account</p>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">📊 Dashboard</Link>
                  <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all">📦 My Orders</Link>
                  {user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all">⚙️ Admin Panel</Link>
                  )}
                </>
              )}
            </nav>

            {user && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full" onClick={handleLogout}>
                  <LogoutIcon className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
