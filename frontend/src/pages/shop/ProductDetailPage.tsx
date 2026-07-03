import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productService, type Product } from "../../services/product";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Rating from "../../components/ui/Rating";
import { HeartIcon, HeartFilledIcon, CartIcon } from "../../components/ui/Icons";
import { useToast, useAuth, useCart, useWishlist } from "../../store";
import { getImageUrl } from "../../utils/image";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const wishlisted = product ? has(product.id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService.get(id)
      .then(setProduct)
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.showError("Please sign in to add items to cart"); return; }
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      toast.showSuccess(`${product.title} added to cart!`);
    } catch (err: any) {
      toast.showError(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    toggle(product.id);
    if (!user) toast.showSuccess(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="sticky top-24 self-start">
          <div className="aspect-square bg-gradient-to-br from-primary-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
            {product.image_url && !imgError ? (
              <img
                src={getImageUrl(product.image_url)}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                {product.category || "General"}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            </div>
            <button
              onClick={toggleWishlist}
              className={`p-2.5 rounded-lg border transition-all flex-shrink-0 ${
                wishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
              }`}
            >
              {wishlisted ? <HeartFilledIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Rating value={4.5} size="sm" showValue />
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">128 reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.price > 50 && (
              <>
                <span className="text-lg text-gray-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
                <Badge variant="danger" size="sm">20% OFF</Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          )}

          {/* Stock status */}
          <div className="mt-6 flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-700">
                  {product.stock > 10 ? "In Stock" : `Only ${product.stock} left in stock`}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-8 flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              loading={adding}
              disabled={product.stock === 0}
              icon={<CartIcon className="w-5 h-5" />}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Free Shipping", desc: "On orders over $50" },
                { label: "Easy Returns", desc: "30-day return policy" },
                { label: "Secure Checkout", desc: "SSL encrypted" },
                { label: "Support", desc: "24/7 customer service" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{f.label}</p>
                    <p className="text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
