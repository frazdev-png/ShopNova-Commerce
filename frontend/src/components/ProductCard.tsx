import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../services/product";
import { useWishlist } from "../store";
import { HeartIcon, HeartFilledIcon, StarIcon } from "./ui/Icons";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

function hashRating(id: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const rating = 3.5 + ((hash & 0x3) * 0.5);
  const count = 50 + (Math.abs(hash) % 451);
  return { rating, count };
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { has, toggle } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const wishlisted = has(product.id);
  const { rating, count } = useMemo(() => hashRating(product.id), [product.id]);
  const discount = product.price > 30 ? (Math.abs(hashRating(product.id + "disc").count) % 25) + 5 : 0;
  const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden flex-shrink-0">
        {product.image_url && !imgError ? (
          <>
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
          </>
        ) : (
          <img src={PLACEHOLDER} alt="" className="w-full h-full object-cover" />
        )}

        {/* Discount badge */}
        {discount > 0 && product.stock > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-gray-950/50 flex items-center justify-center z-10">
            <span className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 text-[11px] font-semibold px-3 py-1 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white dark:hover:bg-gray-700 hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? (
            <HeartFilledIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-red-400 transition-colors" />
          )}
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        {/* Category + Rating row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium truncate">
            {product.category || "General"}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              ({count})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* Price & Add to Cart row */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                ${(discount > 0 ? discountedPrice : product.price).toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Only {product.stock} left
              </p>
            )}
          </div>

          {product.stock > 0 ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
              className="shrink-0 h-9 px-3.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Add
            </button>
          ) : (
            <div className="shrink-0 h-9 px-3.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Sold
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
