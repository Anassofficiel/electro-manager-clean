import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Truck,
  CreditCard,
  Save,
  Globe,
  Instagram,
  Facebook,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const { data: initialSettings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    storeName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    shippingFee: 0,
    codDeposit: 0,
    theme: "light",
    website: "",
    instagram: "",
    facebook: "",
    invoiceFooter: "",
  });

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        storeName: initialSettings.storeName || "",
        phone: initialSettings.phone || "",
        email: initialSettings.email || "",
        address1: initialSettings.address1 || "",
        address2: initialSettings.address2 || "",
        shippingFee: initialSettings.shippingFee || 0,
        codDeposit: initialSettings.codDeposit || 0,
        theme: initialSettings.theme || "light",
        website: initialSettings.website || "",
        instagram: initialSettings.instagram || "",
        facebook: initialSettings.facebook || "",
        invoiceFooter:
          initialSettings.invoiceFooter || "Merci pour votre confiance.",
      });
    }
  }, [initialSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-[760px] rounded-2xl max-w-4xl mx-auto m-6" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100/60 bg-gradient-to-r from-slate-50 via-indigo-50 to-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-bold text-indigo-600">
                <Store className="w-3 h-3" />
                Store configuration
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">
                Store Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Configure your store identity, contact information, delivery,
                and invoice print details.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
              Offline store setup
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Store className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">
                  General Information
                </CardTitle>
              </div>
              <CardDescription>
                Basic details about your store. These details can appear in the
                dashboard and printed documents.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  className="rounded-xl bg-slate-50"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Email</Label>
                  <Input
                    type="email"
                    className="rounded-xl bg-slate-50"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    className="rounded-xl bg-slate-50"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  className="rounded-xl bg-slate-50"
                  value={formData.address1}
                  onChange={(e) =>
                    setFormData({ ...formData, address1: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Address Line 2 (Optional)</Label>
                <Input
                  className="rounded-xl bg-slate-50"
                  value={formData.address2}
                  onChange={(e) =>
                    setFormData({ ...formData, address2: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Globe className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">
                  Online Presence
                </CardTitle>
              </div>
              <CardDescription>
                Add your website and social media so they can appear on invoices
                and professional print pages.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  Website
                </Label>
                <Input
                  className="rounded-xl bg-slate-50"
                  placeholder="https://yourstore.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-slate-500" />
                    Instagram
                  </Label>
                  <Input
                    className="rounded-xl bg-slate-50"
                    placeholder="@yourstore"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-slate-500" />
                    Facebook
                  </Label>
                  <Input
                    className="rounded-xl bg-slate-50"
                    placeholder="facebook.com/yourstore"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Truck className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">
                  Shipping & Delivery
                </CardTitle>
              </div>
              <CardDescription>
                Configure the delivery fee used when an order is marked as
                delivery.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Standard Shipping Fee (dh)</Label>
                <Input
                  type="number"
                  min="0"
                  className="rounded-xl bg-slate-50 font-bold"
                  value={formData.shippingFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingFee: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">
                  Payments
                </CardTitle>
              </div>
              <CardDescription>
                Setup optional payment rules used by your store.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Required Deposit Amount (dh)</Label>
                <Input
                  type="number"
                  min="0"
                  className="rounded-xl bg-slate-50 font-bold text-primary"
                  value={formData.codDeposit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      codDeposit: Number(e.target.value),
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Keep this at 0 if you do not require any deposit before
                  delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">
                  Invoice & Print Footer
                </CardTitle>
              </div>
              <CardDescription>
                This text appears at the bottom of the printed order document.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Invoice Footer</Label>
                <Textarea
                  className="rounded-xl bg-slate-50 min-h-[120px]"
                  placeholder="Merci pour votre confiance."
                  value={formData.invoiceFooter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoiceFooter: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl shadow-lg shadow-primary/20 h-12 px-8"
              disabled={updateSettings.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}