import { useEffect, useState } from "react";
import { categoryService, type Category } from "../../services/category";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../store";

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    categoryService.listAll()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditTarget(null);
    setShowCreate(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.showError("Name is required"); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await categoryService.update(editTarget.id, form);
        toast.showSuccess("Category updated");
      } else {
        await categoryService.create(form);
        toast.showSuccess("Category created");
      }
      resetForm();
      load();
    } catch (err: any) {
      toast.showError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.delete(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.showSuccess(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.showError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>New Category</Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No categories yet</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{cat.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${cat.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                  {cat.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Created {new Date(cat.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => { setEditTarget(cat); setForm({ name: cat.name, description: cat.description || "" }); }}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={showCreate || !!editTarget}
        onClose={resetForm}
        title={editTarget ? "Edit Category" : "New Category"}
        onConfirm={handleSave}
        confirmText={editTarget ? "Update" : "Create"}
        loading={saving}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Category name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Optional description"
            />
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
