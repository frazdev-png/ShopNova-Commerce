import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, type Product } from "../../services/product";
import { categoryService, type Category } from "../../services/category";
import { cartService } from "../../services/cart";
import ProductCard from "../../components/ProductCard";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { SearchIcon, XIcon } from "../../components/ui/Icons";
import { useToast, useAuth } from "../../store";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const activeCategory = searchParams.get("category") || "All";
  const sortBy = searchParams.get("sort") || "newest";
  const searchQuery = searchParams.get("search") || "";
  const perPage = 8;

  useEffect(() => {
    setLoading(true);
    const cat = activeCategory === "All" ? undefined : activeCategory;
    const sort = sortBy === "newest" ? undefined : sortBy;

    productService.list({
      category: cat,
      search: searchQuery || undefined,
      sort_by: sort,
      page,
      per_page: perPage,
    }).then((res) => {
      setProducts(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [activeCategory, sortBy, page, searchQuery]);

  useEffect(() => {
    categoryService.listActive().then(setCategories).catch(() => {});
  }, []);

  const handleCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    params.delete("page");
    setSearchParams(params);
    setPage(1);
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort === "newest") params.delete("sort");
    else params.set("sort", sort);
    setSearchParams(params);
    setPage(1);
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) { toast.showError("Please sign in to add items to cart"); return; }
    try {
      await cartService.add(product.id, 1);
      toast.showSuccess(`${product.title} added to cart!`);
    } catch (err: any) {
      toast.showError(err.message || "Failed to add to cart");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Home / <span className="text-gray-900 dark:text-gray-100 font-medium">Shop</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {searchQuery ? `Search: "${searchQuery}"` : activeCategory === "All" ? "All Products" : activeCategory}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} product{total !== 1 ? "s" : ""} found</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategory(cat)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <span className="text-gray-400 dark:text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Stock Status</h3>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                In Stock Only
              </label>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search results indicator */}
          {searchQuery && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
              <SearchIcon className="w-4 h-4" />
              Results for "{searchQuery}"
              <button
                onClick={() => { setSearchParams({}); setPage(1); }}
                className="ml-auto p-0.5 hover:bg-primary-100 rounded"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 font-semibold">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category or search term.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchParams({}); setPage(1); }}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters" side="left">
        <div className="px-5 py-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { handleCategory(cat); setFilterOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
