import { useEffect, useState } from "react";
import { adminSettingsService, type WebsiteSettings } from "../../services/adminSettings";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useAuth, useToast } from "../../store";

export default function AdminSettings() {
  const { user } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [websiteForm, setWebsiteForm] = useState<WebsiteSettings>({
    site_name: "SHOPNOVA",
    site_tagline: "Smart Shopping, Better Living",
    currency: "USD",
    free_shipping_threshold: 50,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
    adminSettingsService.getWebsite()
      .then(setWebsiteForm)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await adminSettingsService.updateProfile(profileForm);
      setProfileForm({ name: updated.name, email: updated.email });
      toast.showSuccess("Profile updated");
    } catch (err: any) {
      toast.showError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password) { toast.showError("Current password is required"); return; }
    if (passwordForm.new_password.length < 8) { toast.showError("New password must be at least 8 characters"); return; }
    if (passwordForm.new_password !== passwordForm.confirm) { toast.showError("Passwords do not match"); return; }
    setSavingPassword(true);
    try {
      await adminSettingsService.changePassword(passwordForm.current_password, passwordForm.new_password);
      toast.showSuccess("Password changed successfully");
      setPasswordForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err: any) {
      toast.showError(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveWebsite = async () => {
    setSavingWebsite(true);
    try {
      await adminSettingsService.updateWebsite(websiteForm);
      toast.showSuccess("Website settings updated");
    } catch (err: any) {
      toast.showError(err.message || "Failed to update settings");
    } finally {
      setSavingWebsite(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your store and profile settings</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Profile */}
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h2>
          <div className="space-y-4">
            <Input label="Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
            <Button onClick={handleSaveProfile} loading={savingProfile}>Save Changes</Button>
          </div>
        </Card>

        {/* Password */}
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Change Password</h2>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={passwordForm.current_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))} />
            <Input label="New Password" type="password" value={passwordForm.new_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} />
            <Input label="Confirm New Password" type="password" value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
            <Button onClick={handleChangePassword} loading={savingPassword}>Update Password</Button>
          </div>
        </Card>

        {/* Website */}
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Website Settings</h2>
          <div className="space-y-4">
            <Input label="Site Name" value={websiteForm.site_name}
              onChange={(e) => setWebsiteForm((p) => ({ ...p, site_name: e.target.value }))} />
            <Input label="Tagline" value={websiteForm.site_tagline}
              onChange={(e) => setWebsiteForm((p) => ({ ...p, site_tagline: e.target.value }))} />
            <Input label="Currency" value={websiteForm.currency}
              onChange={(e) => setWebsiteForm((p) => ({ ...p, currency: e.target.value }))} />
            <Input label="Free Shipping Threshold ($)" type="number" value={String(websiteForm.free_shipping_threshold)}
              onChange={(e) => setWebsiteForm((p) => ({ ...p, free_shipping_threshold: parseFloat(e.target.value) || 0 }))} />
            <Button onClick={handleSaveWebsite} loading={savingWebsite}>Save Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
