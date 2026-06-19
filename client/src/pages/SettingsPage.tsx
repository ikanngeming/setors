import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");

  const { data: settings } = trpc.settings.get.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      toast.success("Berhasil logout");
    },
  });

  const updateProfileMutation = trpc.settings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui profil");
    },
  });

  useEffect(() => {
    if (settings?.name) {
      setName(settings.name || "");
    }
  }, [settings]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length < 2) {
      toast.error("Nama minimal 2 karakter");
      return;
    }

    updateProfileMutation.mutate({ name });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola profil dan preferensi Anda
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <User size={20} />
          Profil Pengguna
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              placeholder="Masukkan nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />
          </div>

          {/* Email Display */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={settings?.email || user?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Role Display */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              type="text"
              value={settings?.role === "admin" ? "Administrator" : "User"}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Status Display */}
          <div className="space-y-2">
            <Label>Status Akun</Label>
            <Input
              type="text"
              value={
                settings?.status === "active"
                  ? "Aktif"
                  : settings?.status === "suspended"
                  ? "Suspend"
                  : "Banned"
              }
              disabled
              className="bg-muted"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </form>
      </Card>

      {/* Account Info Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informasi Akun</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bergabung sejak:</span>
            <span className="font-medium">
              {settings?.createdAt
                ? new Date(settings.createdAt).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Pengguna:</span>
            <span className="font-medium">{settings?.id || "-"}</span>
          </div>
        </div>
      </Card>

      {/* Logout Card */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold mb-4 text-red-900">Keluar</h2>
        <p className="text-sm text-red-800 mb-4">
          Logout dari akun Anda. Anda akan perlu login kembali untuk mengakses aplikasi.
        </p>
        <Button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          variant="destructive"
        >
          {logoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logout...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
