import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { adminProductService } from "../../services/adminProduct";
import { productService } from "../../services/product";
import { categoryService, type Category } from "../../services/category";
import { uploadService } from "../../services/upload";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../store";
import { getImageUrl } from "../../utils/image";

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoryService.listAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      productService.get(id).then((p) => {
        setForm({
          title: p.title,
          description: p.description || "",
          price: String(p.price),
          stock: String(p.stock),
          category: p.category || "",
        });
        if (p.image_url) setImagePreview(getImageUrl(p.image_url));
      }).catch(() => navigate("/admin/products")).finally(() => setLoadingProduct(false));
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.showError("Invalid file type. Allowed: JPEG, PNG, GIF, WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.showError("File too large. Max 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { setError("Price must be a positive number"); return; }
    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0) { setError("Stock must be a non-negative number"); return; }

    setSubmitting(true);
    try {
      let image_url = imagePreview || undefined;

      // Upload image if selected
      if (imageFile) {
        setUploading(true);
        image_url = await uploadService.uploadImage(imageFile);
        setUploading(false);
      }

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price,
        stock,
        category: form.category || undefined,
        image_url,
      };

      if (isEdit && id) {
        await adminProductService.update(id, payload);
        toast.showSuccess("Product updated");
      } else {
        await adminProductService.create(payload);
        toast.showSuccess("Product created");
      }
      navigate("/admin/products");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loadingProduct) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/products" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 inline-flex items-center gap-1 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {isEdit ? "Edit Product" : "Create Product"}
      </h1>

      <Card className="p-8">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Product name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price *" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" />
            <Input label="Stock *" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
          </div>

          {/* Category dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Image upload (replaces URL input) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("image-input")?.click()}>
                  <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</p>
                </div>
                <input
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              {imagePreview && (
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={submitting || uploading}>
              {uploading ? "Uploading..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/products")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
