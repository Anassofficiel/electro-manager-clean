import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useCreateOrder, useProducts } from "@/hooks/use-local-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PlusSquare,
    Trash2,
    Package,
    User,
    ShoppingCart,
    CreditCard,
    FileText,
    Truck,
    Tag,
    StickyNote,
    AlertCircle,
    CheckCircle2,
    Phone,
    MapPin,
    Building2,
} from "lucide-react";

type DraftItem = {
    productId: string;
    title: string;
    image: string;
    qty: number;
    price: number;
};

function PhoneInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const isValid = digits.length === 10;
    const isEmpty = digits.length === 0;

    return (
        <div className="space-y-1">
            <div
                className={`flex items-center rounded-xl border-2 overflow-hidden transition-all bg-white ${isEmpty
                        ? "border-slate-200"
                        : isValid
                            ? "border-emerald-400 shadow-sm shadow-emerald-100"
                            : "border-rose-400 shadow-sm shadow-rose-100"
                    }`}
            >
                <span className="px-3 py-2.5 bg-indigo-50 border-r-2 border-indigo-100 text-indigo-700 font-bold text-sm select-none whitespace-nowrap">
                    +212
                </span>
                <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0612345678"
                    value={digits}
                    onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 px-3 py-2.5 text-sm font-medium outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                />
                {!isEmpty && (
                    <span className="pr-3">
                        {isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                    </span>
                )}
            </div>
            {!isEmpty && !isValid && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    يجب إدخال 10 أرقام بالضبط — Exactly 10 digits required
                </p>
            )}
        </div>
    );
}

function FieldLabel({
    en,
    ar,
    required,
    icon: Icon,
}: {
    en: string;
    ar: string;
    required?: boolean;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-center gap-2 mb-1.5">
            {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500" />}
            <span className="text-sm font-bold text-slate-700">
                {en}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {ar}</span>
        </div>
    );
}

function SectionCard({
    icon: Icon,
    title,
    titleAr,
    children,
    accent = "indigo",
}: {
    icon: React.ElementType;
    title: string;
    titleAr: string;
    children: React.ReactNode;
    accent?: "indigo" | "emerald" | "violet" | "amber";
}) {
    const colors = {
        indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "from-emerald-500 to-emerald-600 bg-emerald-50 border-emerald-100",
        violet: "from-violet-500 to-violet-600 bg-violet-50 border-violet-100",
        amber: "from-amber-500 to-amber-600 bg-amber-50 border-amber-100",
    };
    const [gradient, bg, border] = colors[accent].split(" ");

    return (
        <div className={`rounded-2xl border ${border} ${bg} overflow-hidden shadow-sm`}>
            <div className={`px-5 py-3.5 bg-gradient-to-r ${gradient} flex items-center gap-2.5`}>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <span className="font-black text-white text-sm">{title}</span>
                    <span className="text-white/70 text-xs mr-1 ml-2">/ {titleAr}</span>
                </div>
            </div>
            <div className="p-5 bg-white">{children}</div>
        </div>
    );
}

function SettingRow({
    label,
    labelAr,
    description,
    descriptionAr,
    children,
    icon: Icon,
}: {
    label: string;
    labelAr: string;
    description?: string;
    descriptionAr?: string;
    children: React.ReactNode;
    icon?: React.ElementType;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
            <div className="flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500" />}
                <span className="text-sm font-bold text-slate-800">{label}</span>
                <span className="text-xs text-slate-400">/ {labelAr}</span>
            </div>
            {(description || descriptionAr) && (
                <p className="text-xs text-slate-500 leading-relaxed">
                    {description && <span>{description}</span>}
                    {descriptionAr && <span className="text-slate-400"> — {descriptionAr}</span>}
                </p>
            )}
            <div>{children}</div>
        </div>
    );
}

export default function NewOrderPage() {
    const [, setLocation] = useLocation();
    const createOrder = useCreateOrder();
    const { data: products, isLoading } = useProducts();

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerCity, setCustomerCity] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [status, setStatus] = useState("New");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [deliveryType, setDeliveryType] = useState<"store_pickup" | "delivery">("store_pickup");
    const [shipping, setShipping] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<DraftItem[]>([]);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
        [items]
    );

    const total = Math.max(subtotal + Number(shipping || 0) - Number(discount || 0), 0);
    const phoneValid = customerPhone.length === 10;

    const addProduct = (productId: string) => {
        const product = (products || []).find((p: any) => String(p.id) === productId);
        if (!product) return;

        const existing = items.find((item) => item.productId === productId);
        if (existing) {
            setItems((prev) =>
                prev.map((item) =>
                    item.productId === productId ? { ...item, qty: item.qty + 1 } : item
                )
            );
            return;
        }

        setItems((prev) => [
            ...prev,
            {
                productId,
                title: product.title,
                image: product.images?.[0] || "",
                qty: 1,
                price: Number(product.price || 0),
            },
        ]);
    };

    const updateQty = (productId: string, qty: number) => {
        if (qty < 1) return;
        setItems((prev) =>
            prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
        );
    };

    const updatePrice = (productId: string, price: number) => {
        setItems((prev) =>
            prev.map((item) => (item.productId === productId ? { ...item, price } : item))
        );
    };

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const canSubmit =
        customerName.trim() &&
        phoneValid &&
        customerCity.trim() &&
        customerAddress.trim() &&
        items.length > 0;

    const handleSubmit = (printAfterSave = false) => {
        if (!canSubmit) return;

        createOrder.mutate(
            {
                customerName: customerName.trim(),
                customerPhone: "+212" + customerPhone.trim(),
                customerCity: customerCity.trim(),
                customerAddress: customerAddress.trim(),
                status,
                paymentMethod,
                shipping: Number(shipping || 0),
                discount: Number(discount || 0),
                source: "offline",
                delivery_type: deliveryType,
                notes: notes.trim(),
                created_by: "admin",
                items: items.map((item) => ({
                    image: item.image,
                    title: item.title,
                    qty: Number(item.qty || 0),
                    price: Number(item.price || 0),
                })),
            },
            {
                onSuccess: (created: any) => {
                    const orderId = created?.id;

                    if (printAfterSave && orderId) {
                        setLocation(`/admin/orders/print/${orderId}`);
                        return;
                    }

                    setLocation("/admin/orders");
                },
            }
        );
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="space-y-4">
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-[500px] rounded-3xl" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-5 pb-12 max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 shadow-lg shadow-indigo-200">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold text-white">
                                <PlusSquare className="w-3 h-3" />
                                Offline Order / طلب يدوي
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white">
                                New Order
                                <span className="text-white/60 font-medium text-lg mr-2 ml-2">/ طلب جديد</span>
                            </h1>
                            <p className="mt-1 text-sm text-indigo-200">
                                Create a manual order and save it to your dashboard.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-3 text-white">
                            <p className="text-xs text-white/60 mb-0.5">المجموع الكلي / Total</p>
                            <p className="text-2xl font-black">{total.toLocaleString()} dh</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="xl:col-span-2 space-y-5">
                        <SectionCard icon={User} title="Customer Information" titleAr="معلومات الزبون" accent="indigo">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <FieldLabel en="Full Name" ar="الاسم الكامل" required icon={User} />
                                    <Input
                                        placeholder="Ex: Mohammed Alami"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="rounded-xl border-2 border-slate-200 focus:border-indigo-400 bg-white h-11"
                                    />
                                </div>

                                <div>
                                    <FieldLabel en="Phone Number" ar="رقم الهاتف" required icon={Phone} />
                                    <PhoneInput value={customerPhone} onChange={setCustomerPhone} />
                                </div>

                                <div>
                                    <FieldLabel en="City" ar="المدينة" required icon={Building2} />
                                    <Input
                                        placeholder="Ex: Casablanca"
                                        value={customerCity}
                                        onChange={(e) => setCustomerCity(e.target.value)}
                                        className="rounded-xl border-2 border-slate-200 focus:border-indigo-400 bg-white h-11"
                                    />
                                </div>

                                <div>
                                    <FieldLabel en="Address" ar="العنوان التفصيلي" required icon={MapPin} />
                                    <Input
                                        placeholder="Ex: Hay Mohammadi, Rue 5"
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        className="rounded-xl border-2 border-slate-200 focus:border-indigo-400 bg-white h-11"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard icon={Package} title="Order Items" titleAr="منتجات الطلب" accent="violet">
                            <div className="mb-4">
                                <FieldLabel en="Add Product" ar="إضافة منتج" icon={ShoppingCart} />
                                <Select onValueChange={addProduct}>
                                    <SelectTrigger className="rounded-xl border-2 border-slate-200 focus:border-violet-400 h-11 bg-white">
                                        <SelectValue placeholder="Select a product to add... / اختر منتجا" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(products || []).map((product: any) => (
                                            <SelectItem key={product.id} value={String(product.id)}>
                                                {product.title} — {Number(product.price || 0).toLocaleString()} dh
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                {items.length === 0 ? (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-slate-400">No products added yet</p>
                                        <p className="text-xs text-slate-300 mt-1">لم يتم إضافة منتجات بعد</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex flex-col gap-3 rounded-2xl border-2 border-slate-100 hover:border-violet-100 bg-slate-50 p-4 transition-colors md:flex-row md:items-center md:gap-4"
                                        >
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                                />
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-800 truncate text-sm">{item.title}</p>
                                                <p className="text-xs text-violet-600 font-semibold mt-0.5">
                                                    {(item.qty * item.price).toLocaleString()} dh المجموع
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-slate-400 mb-1">Qty / الكمية</p>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={item.qty}
                                                        onChange={(e) => updateQty(item.productId, Number(e.target.value || 1))}
                                                        className="w-20 rounded-xl border-2 border-slate-200 text-center h-9 text-sm font-bold"
                                                    />
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-[10px] text-slate-400 mb-1">Price / السعر (dh)</p>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={item.price}
                                                        onChange={(e) =>
                                                            updatePrice(item.productId, Number(e.target.value || 0))
                                                        }
                                                        className="w-28 rounded-xl border-2 border-slate-200 text-center h-9 text-sm font-bold"
                                                    />
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-[10px] text-transparent mb-1">x</p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-xl text-rose-500 border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-300"
                                                        onClick={() => removeItem(item.productId)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="space-y-5">
                        <SectionCard icon={ShoppingCart} title="Order Settings" titleAr="إعدادات الطلب" accent="emerald">
                            <div className="space-y-3">
                                <SettingRow
                                    label="Order Status"
                                    labelAr="حالة الطلب"
                                    description="Current state of the order."
                                    descriptionAr="الحالة الراهنة للطلب"
                                >
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="rounded-xl border-2 border-slate-200 h-10 bg-white text-sm">
                                            <SelectValue placeholder="Order status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="New">🆕 New / جديد</SelectItem>
                                            <SelectItem value="Confirmed">✅ Confirmed / مؤكد</SelectItem>
                                            <SelectItem value="Out for Delivery">🚚 Out for Delivery / في التوصيل</SelectItem>
                                            <SelectItem value="Delivered">📦 Delivered / تم التسليم</SelectItem>
                                            <SelectItem value="Cancelled">❌ Cancelled / ملغي</SelectItem>
                                            <SelectItem value="Returned">↩️ Returned / مرجع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </SettingRow>

                                <SettingRow
                                    label="Payment Method"
                                    labelAr="طريقة الدفع"
                                    description="How the customer will pay."
                                    descriptionAr="كيفية أداء الثمن"
                                    icon={CreditCard}
                                >
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="rounded-xl border-2 border-slate-200 h-10 bg-white text-sm">
                                            <SelectValue placeholder="Payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">💵 Cash / نقدا</SelectItem>
                                            <SelectItem value="Cash on Delivery">🚚 Cash on Delivery / عند التسليم</SelectItem>
                                            <SelectItem value="Bank Transfer">🏦 Bank Transfer / تحويل بنكي</SelectItem>
                                            <SelectItem value="Card">💳 Card / بطاقة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </SettingRow>

                                <SettingRow
                                    label="Delivery Type"
                                    labelAr="نوع التوصيل"
                                    description="Pickup from store or home delivery."
                                    descriptionAr="استلام من المحل أو توصيل للبيت"
                                    icon={Truck}
                                >
                                    <Select
                                        value={deliveryType}
                                        onValueChange={(v: "store_pickup" | "delivery") => setDeliveryType(v)}
                                    >
                                        <SelectTrigger className="rounded-xl border-2 border-slate-200 h-10 bg-white text-sm">
                                            <SelectValue placeholder="Delivery type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="store_pickup">🏪 Store Pickup / استلام من المحل</SelectItem>
                                            <SelectItem value="delivery">🚚 Delivery / توصيل للبيت</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </SettingRow>

                                <SettingRow
                                    label="Shipping"
                                    labelAr="ثمن التوصيل"
                                    description="Delivery cost added to the total."
                                    descriptionAr="تكلفة التوصيل تضاف للمجموع"
                                    icon={Truck}
                                >
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="Ex: 30"
                                            value={shipping || ""}
                                            onChange={(e) => setShipping(Number(e.target.value || 0))}
                                            className="rounded-xl border-2 border-slate-200 h-10 bg-white text-sm pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            dh
                                        </span>
                                    </div>
                                </SettingRow>

                                <SettingRow
                                    label="Discount"
                                    labelAr="التخفيض"
                                    description="Amount deducted from the total (optional)."
                                    descriptionAr="المبلغ المخفض من المجموع (اختياري)"
                                    icon={Tag}
                                >
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="Ex: 50"
                                            value={discount || ""}
                                            onChange={(e) => setDiscount(Number(e.target.value || 0))}
                                            className="rounded-xl border-2 border-slate-200 h-10 bg-white text-sm pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            dh
                                        </span>
                                    </div>
                                </SettingRow>

                                <SettingRow
                                    label="Notes"
                                    labelAr="ملاحظات"
                                    description="Any extra info about this order."
                                    descriptionAr="أي معلومة إضافية حول الطلب"
                                    icon={StickyNote}
                                >
                                    <Textarea
                                        placeholder="Notes / ملاحظات..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="rounded-xl border-2 border-slate-200 bg-white text-sm resize-none min-h-[80px]"
                                    />
                                </SettingRow>
                            </div>
                        </SectionCard>

                        <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 font-black text-slate-800 flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                                    <CreditCard className="w-3 h-3 text-indigo-600" />
                                </div>
                                Summary / الملخص
                            </h2>

                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Subtotal / المجموع الجزئي</span>
                                    <span className="font-bold">{subtotal.toLocaleString()} dh</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Shipping / التوصيل</span>
                                    <span className="font-bold text-blue-600">
                                        +{Number(shipping || 0).toLocaleString()} dh
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Discount / التخفيض</span>
                                    <span className="font-bold text-emerald-600">
                                        -{Number(discount || 0).toLocaleString()} dh
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-slate-100 pt-3 mt-2">
                                    <span className="font-black text-slate-800 text-base">Total / المجموع</span>
                                    <span className="font-black text-xl text-indigo-600">
                                        {total.toLocaleString()} dh
                                    </span>
                                </div>
                            </div>

                            {!canSubmit && (
                                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Fill all required fields and add at least one product.
                                        <br />
                                        <span className="text-amber-600">
                                            أكمل جميع الحقول الإلزامية وأضف منتجا واحدا على الأقل.
                                        </span>
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 space-y-2">
                                <Button
                                    className="w-full rounded-xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50"
                                    onClick={() => handleSubmit(false)}
                                    disabled={createOrder.isPending || !canSubmit}
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Save Order / حفظ الطلب
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl h-11 font-bold border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                                    onClick={() => handleSubmit(true)}
                                    disabled={createOrder.isPending || !canSubmit}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Save & Print / حفظ وطباعة
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}