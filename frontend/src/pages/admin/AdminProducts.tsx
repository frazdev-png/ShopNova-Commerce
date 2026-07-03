import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService, type Product } from "../../services/product";
import { adminProductService } from "../../services/adminProduct";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../store";
import { getImageUrl } from "../../utils/image";

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    productService.list().then((res) => setProducts(res.items)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminProductService.delete(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.showSuccess(`"${deleteTarget.title}" deleted`);
    } catch (err: any) {
      toast.showError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const updated = await adminProductService.update(p.id, { is_active: !p.is_active });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: updated.is_active } : x)));
      toast.showSuccess(`${p.title} ${updated.is_active ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.showError(err.message || "Update failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link to="/admin/products/create">
          <Button icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>New Product</Button>
        </Link>
      </div>

      {loading ? (
        <Card><TableSkeleton rows={6} cols={5} /></Card>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            title="No products yet"
            description="Create your first product to start selling."
            action={{ label: "Create Product", onClick: () => window.location.href = "/admin/products/create" }}
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-semibold">Product</th>
                  <th className="text-left px-6 py-4 font-semibold">Category</th>
                  <th className="text-left px-6 py-4 font-semibold">Price</th>
                  <th className="text-left px-6 py-4 font-semibold">Stock</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-gray-100 dark:from-primary-900/30 dark:to-gray-800">
                          {p.image_url ? (
                            <img src={getImageUrl(p.image_url)} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.category || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${p.stock > 0 ? "text-gray-900 dark:text-gray-100" : "text-red-500"}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          p.is_active
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
