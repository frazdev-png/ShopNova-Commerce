import { useEffect, useState } from "react";
import { adminCustomerService, type Customer } from "../../services/adminCustomer";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../store";

export default function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminCustomerService.list()
      .then((r) => setCustomers(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (customer: Customer) => {
    try {
      await adminCustomerService.updateStatus(customer.id, !customer.is_active);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, is_active: !c.is_active } : c)),
      );
      toast.showSuccess(`${customer.name} ${customer.is_active ? "deactivated" : "activated"}`);
    } catch (err: any) {
      toast.showError(err.message || "Failed to update customer");
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No customers yet</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-semibold">Name</th>
                  <th className="text-left px-6 py-4 font-semibold">Email</th>
                  <th className="text-left px-6 py-4 font-semibold">Joined</th>
                  <th className="text-left px-6 py-4 font-semibold">Orders</th>
                  <th className="text-left px-6 py-4 font-semibold">Spent</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.email}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{c.order_count}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      ${c.total_spent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.is_active ? "success" : "gray"} size="sm">
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          c.is_active
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                            : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                        }`}
                      >
                        {c.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
