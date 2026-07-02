import { useEffect, useState } from "react";
import { productService, type Product } from "../services/product";
import { wishlistService } from "../services/wishlist";
import { cartService } from "../services/cart";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import { HeartIcon } from "../components/ui/Icons";
import { useAuth, useToast } from "../store";

export default function WishlistPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const ids = wishlistService.getAll();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    // Fetch all products and filter by wishlist ids
    productService.list()
      .then((res) => setProducts(res.items.filter((p) => ids.includes(p.id))))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) { toast.showError("Please sign in to add items to cart"); return; }
    try {
      await cartService.add(product.id, 1);
      toast.showSuccess(`${product.title} added to cart!`);
    } catch (err: any) {
      toast.showError(err.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={<HeartIcon className="w-16 h-16 text-gray-300" />}
          title="Your wishlist is empty"
          description="Save your favorite items by clicking the heart icon on any product."
          action={{ label: "Browse Products", onClick: () => window.location.href = "/shop" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-sm text-gray-500 mt-1">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
