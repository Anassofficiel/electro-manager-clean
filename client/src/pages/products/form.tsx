import { useState, useEffect } from "react";
import { useProduct, useCreateProduct, useUpdateProduct } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  Tag,
  Package,
  BarChart2,
  Store,
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isEditing = !!id && id !== "new";
  const { data: initialData, isLoading } = useProduct(isEditing ? Number(id) : 0);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    category: "",
    price: 0,
    compareAtPrice: "",
    stock: 0,
    images: [] as string[],
    rating: 5,
    isPromotion: false,
    isPack: false,
    packGroup: "",
    isActive: true,
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || "",
        brand: initialData.brand || "",
        category: initialData.category || "",
        price: initialData.price || 0,
        compareAtPrice: initialData.compareAtPrice?.toString() || "",
        stock: initialData.stock || 0,
        images: initialData.images || [],
        rating: initialData.rating || 5,
        isPromotion: initialData.isPromotion ?? false,
        isPack: initialData.isPack ?? false,
        packGroup: initialData.packGroup || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [isEditing, initialData]);

  const slugify = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.brand.trim() || !formData.category.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Remplis le nom, la marque et la catégorie. / عمر الاسم والماركة والفئة.",
        variant: "destructive",
      });
      return;
    }

    if (Number(formData.price || 0) <= 0) {
      toast({
        title: "Prix invalide",
        description: "Le prix doit être supérieur à 0. / الثمن خاصو يكون أكبر من 0.",
        variant: "destructive",
      });
      return;
    }

    if (Number(formData.stock || 0) < 0) {
      toast({
        title: "Stock invalide",
        description: "Le stock ne peut pas être négatif. / المخزون ما يمكنش يكون سالب.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      hoverImage: null,
      slug: slugify(formData.title),
      specs: [] as { label: string; value: string }[],
      sku: `AUTO-${Date.now()}`,
      description: null,
      tags: [] as string[],
      packGroup: formData.isPack ? formData.packGroup || null : null,
      rating: Number(formData.rating || 0),
      reviews: 0,
    };

    if (isEditing) {
      updateProduct.mutate(
        { id: Number(id), ...payload },
        {
          onSuccess: () => {
            toast({
              title: "Produit modifié",
              description: "Le produit a été mis à jour avec succès. / تم تحديث المنتج بنجاح.",
            });
            setTimeout(() => {
              setLocation("/admin/products");
            }, 500);
          },
          onError: (error: any) => {
            console.error("Update product failed:", error);
            toast({
              title: "Échec de modification",
              description:
                error?.message ||
                "Une erreur est survenue pendant la mise à jour. / وقع خطأ أثناء التعديل.",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createProduct.mutate(payload as any, {
        onSuccess: () => {
          toast({
            title: "Produit créé",
            description: "Le produit a été ajouté avec succès. / تمت إضافة المنتج بنجاح.",
          });
          setTimeout(() => {
            setLocation("/admin/products");
          }, 500);
        },
        onError: (error: any) => {
          console.error("Create product failed:", error);
          toast({
            title: "Échec de création",
            description:
              error?.message ||
              "Une erreur est survenue pendant la création. / وقع خطأ أثناء إضافة المنتج.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (formData.images.includes(trimmed)) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.images.length - 1)
    ) {
      return;
    }

    const newImages = [...formData.images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-[600px] rounded-2xl" />
      </AdminLayout>
    );
  }

  const BLabel = ({
    en,
    ar,
    required,
  }: {
    en: string;
    ar: string;
    required?: boolean;
  }) => (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-sm font-bold text-slate-700">
        {en}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      <span className="text-xs text-slate-400">/ {ar}</span>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    en,
    ar,
    color = "indigo",
  }: {
    icon: React.ElementType;
    en: string;
    ar: string;
    color?: "indigo" | "violet" | "emerald" | "amber";
  }) => {
    const styles = {
      indigo: {
        header: "bg-gradient-to-r from-indigo-50 to-white",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
      violet: {
        header: "bg-gradient-to-r from-violet-50 to-white",
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
      },
      emerald: {
        header: "bg-gradient-to-r from-emerald-50 to-white",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      amber: {
        header: "bg-gradient-to-r from-amber-50 to-white",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    };

    const s = styles[color];

    return (
      <CardHeader className={`border-b border-border/50 pb-4 rounded-t-2xl ${s.header}`}>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.iconBg}`}>
            <Icon className={`w-4 h-4 ${s.iconColor}`} />
          </div>
          <span>{en}</span>
          <span className="text-sm font-normal text-slate-400">/ {ar}</span>
        </CardTitle>
      </CardHeader>
    );
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 pb-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white shadow-sm border-2 border-slate-200 hover:border-indigo-300"
              asChild
            >
              <Link href="/admin/products">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold h-11 px-5"
            disabled={
              createProduct.isPending || updateProduct.isPending
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Save Changes / حفظ التعديلات" : "Create Product / إضافة المنتج"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm border-2 border-slate-100">
              <SectionHeader icon={Package} en="General Information" ar="المعلومات الأساسية" color="indigo" />

              <CardContent className="pt-6 space-y-5">
                <div>
                  <BLabel en="Product Title" ar="اسم المنتج" required />
                  <Input
                    required
                    className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 h-11"
                    placeholder="Ex: Samsung TV 55 pouces..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <BLabel en="Brand" ar="العلامة التجارية" required />
                    <Input
                      required
                      className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 h-11"
                      placeholder="Ex: Samsung, LG, Beko..."
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>

                  <div>
                    <BLabel en="Category" ar="الفئة / التصنيف" required />
                    <Input
                      required
                      className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 h-11"
                      placeholder="Ex: Réfrigérateurs, TV..."
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-2 border-slate-100">
              <SectionHeader icon={ImageIcon} en="Product Images" ar="صور المنتج" color="violet" />

              <CardContent className="pt-6 space-y-4">
                <div>
                  <BLabel en="Add Image URL" ar="أضف رابط صورة" />
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      className="rounded-xl bg-slate-50 border-2 border-slate-200 h-11 flex-1"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddImage}
                      variant="secondary"
                      className="rounded-xl h-11 px-5 font-bold"
                    >
                      Add / أضف
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    First image will be the main display image. / الصورة الأولى هي الصورة الرئيسية.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  {formData.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50"
                    >
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => moveImage(i, "up")}
                          disabled={i === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => removeImage(i)}
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => moveImage(i, "down")}
                          disabled={i === formData.images.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData.images.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-muted-foreground flex flex-col items-center">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm font-semibold">No images added yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">لم تتم إضافة صور بعد</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-2 border-slate-100">
              <SectionHeader icon={Tag} en="Pricing" ar="الأسعار" color="emerald" />

              <CardContent className="pt-6 space-y-4">
                <div>
                  <BLabel en="Selling Price" ar="سعر البيع" required />
                  <div className="relative">
                    <Input
                      type="number"
                      required
                      min="0"
                      className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 font-bold text-lg h-12 pr-12"
                      placeholder="0"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, price: Number(e.target.value) })
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                      dh
                    </span>
                  </div>
                </div>

                <div>
                  <BLabel en="Compare-at Price" ar="السعر الأصلي (قبل التخفيض)" />
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 h-11 pr-12"
                      placeholder="Optional / اختياري"
                      value={formData.compareAtPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, compareAtPrice: e.target.value })
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                      dh
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    يظهر مشطوبا بجانب السعر الجديد لإبراز التخفيض.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-2 border-slate-100">
              <SectionHeader icon={BarChart2} en="Inventory" ar="المخزون" color="amber" />

              <CardContent className="pt-6 space-y-4">
                <div>
                  <BLabel en="Quantity in Stock" ar="الكمية المتوفرة" required />
                  <Input
                    type="number"
                    required
                    min="0"
                    className="rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 h-11"
                    placeholder="0"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    عدد القطع المتاحة في المخزن حاليا.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-2 border-slate-100">
              <SectionHeader icon={Store} en="Store Display" ar="إعدادات العرض" color="indigo" />

              <CardContent className="pt-6 space-y-4">
                <div>
                  <BLabel en="Rating" ar="التقييم (من 5)" />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="rounded-xl bg-slate-50 border-2 border-slate-200 h-11"
                    placeholder="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    التقييم الذي يظهر للزبناء على الموقع (من 0 إلى 5).
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between rounded-xl border-2 border-slate-100 hover:border-rose-200 px-4 py-3 bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">
                        Promotion Product
                      </span>
                      <span className="text-xs text-slate-400">منتج في العروض / Promo</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPromotion}
                      onChange={(e) =>
                        setFormData({ ...formData, isPromotion: e.target.checked })
                      }
                      className="w-4 h-4 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border-2 border-slate-100 hover:border-violet-200 px-4 py-3 bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">
                        Part of a Pack
                      </span>
                      <span className="text-xs text-slate-400">ينتمي لمجموعة / Pack</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPack}
                      onChange={(e) =>
                        setFormData({ ...formData, isPack: e.target.checked })
                      }
                      className="w-4 h-4 accent-violet-500"
                    />
                  </label>

                  {formData.isPack && (
                    <div>
                      <BLabel en="Pack Group ID" ar="كود المجموعة" />
                      <Input
                        placeholder="Ex: pack-cuisine-2024"
                        className="rounded-xl bg-slate-50 border-2 border-slate-200 h-11"
                        value={formData.packGroup}
                        onChange={(e) =>
                          setFormData({ ...formData, packGroup: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between rounded-xl border-2 border-slate-100 hover:border-emerald-200 px-4 py-3 bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">
                        Visible in Store
                      </span>
                      <span className="text-xs text-slate-400">ظاهر في الموقع / Actif</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Live Preview / معاينة حية
              </Label>

              <Card className="rounded-2xl overflow-hidden shadow-md border-2 border-slate-100 bg-white">
                <div className="aspect-square bg-slate-100 relative">
                  {formData.images[0] ? (
                    <img
                      src={formData.images[0]}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}

                  {formData.compareAtPrice &&
                    Number(formData.compareAtPrice) > formData.price && (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                        Sale
                      </div>
                    )}

                  {formData.isPromotion && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      Promo
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {formData.brand || "Brand / العلامة"}
                  </p>
                  <p className="font-bold line-clamp-1 mb-2 text-sm">
                    {formData.title || "Product Title / اسم المنتج"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-indigo-600 text-lg">
                      {formData.price || "0"} dh
                    </span>
                    {formData.compareAtPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formData.compareAtPrice} dh
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}