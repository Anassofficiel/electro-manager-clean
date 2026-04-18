import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Store } from "lucide-react";

type OrderItem = {
    title: string;
    qty: number;
    price: number;
    image?: string;
};

type OrderData = {
    id: number;
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    status: string;
    paymentMethod: string;
    shipping: number;
    discount: number;
    total: number;
    subtotal?: number;
    source?: string;
    delivery_type?: string;
    notes?: string;
    date?: string;
    created_at?: string;
    items: OrderItem[];
};

type SettingsData = {
    storeName?: string;
    phone?: string;
    email?: string;
    address1?: string;
    address2?: string;
    invoiceFooter?: string;
};

function formatDate(value?: string) {
    if (!value) return new Date().toLocaleString("fr-FR");
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("fr-FR");
}

function getWarrantyText(order: OrderData) {
    if (order.notes?.toLowerCase().includes("garantie")) {
        return order.notes;
    }
    return "Garantie selon le produit et sur présentation de ce ticket.";
}

export default function PrintOrderPage() {
    const [location, setLocation] = useLocation();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [didAutoPrint, setDidAutoPrint] = useState(false);

    const orderId = useMemo(() => {
        const parts = location.split("/");
        return parts[parts.length - 1] || "";
    }, [location]);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                setLoading(true);

                const [orderRes, settingsRes] = await Promise.all([
                    fetch(`/api/orders/${orderId}`),
                    fetch("/api/settings"),
                ]);

                if (!orderRes.ok) {
                    throw new Error("Failed to load order");
                }

                const orderJson = await orderRes.json();
                const settingsJson = settingsRes.ok ? await settingsRes.json() : null;

                if (cancelled) return;

                setOrder(orderJson);
                setSettings(settingsJson);
            } catch (error) {
                console.error("Print page load failed:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (orderId) {
            loadData();
        }

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    useEffect(() => {
        if (!loading && order && !didAutoPrint) {
            const timer = window.setTimeout(() => {
                window.print();
                setDidAutoPrint(true);
            }, 600);

            return () => window.clearTimeout(timer);
        }
    }, [loading, order, didAutoPrint]);

    const subtotal =
        order?.subtotal ??
        order?.items?.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0) ??
        0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <div className="rounded-2xl bg-white border border-slate-200 px-6 py-4 text-sm font-medium text-slate-500 shadow-sm">
                    Loading printable ticket...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <div className="rounded-2xl bg-white border border-rose-200 px-6 py-5 text-sm text-rose-600 shadow-sm">
                    Impossible de charger le ticket.
                    <div className="mt-3">
                        <Button onClick={() => setLocation("/admin/orders")} variant="outline">
                            Retour aux commandes
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
        @page {
          size: 80mm auto;
          margin: 6mm;
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .ticket-shell {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
          }

          .ticket-paper {
            padding: 0 !important;
          }
        }
      `}</style>

            <div className="min-h-screen bg-slate-100 py-6 px-3">
                <div className="no-print max-w-3xl mx-auto mb-4 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setLocation("/admin/orders")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to orders
                    </Button>

                    <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700">
                        <Printer className="w-4 h-4 mr-2" />
                        Print again
                    </Button>
                </div>

                <div className="ticket-shell mx-auto w-full max-w-[80mm] rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="ticket-paper p-4 text-[12px] leading-tight text-black">
                        <div className="text-center border-b border-dashed border-slate-300 pb-3">
                            <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Store className="w-5 h-5 text-indigo-700" />
                            </div>

                            <h1 className="font-black text-[15px] uppercase tracking-wide">
                                {settings?.storeName || "ELECTRO MOUSTAFA"}
                            </h1>

                            {settings?.phone && <p className="mt-1">{settings.phone}</p>}
                            {settings?.address1 && <p>{settings.address1}</p>}
                            {settings?.address2 && <p>{settings.address2}</p>}
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">Ticket #</span>
                                <span>{order.id}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">Date</span>
                                <span className="text-right">{formatDate(order.created_at || order.date)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">Status</span>
                                <span>{order.status}</span>
                            </div>
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                            <p className="font-black mb-1">Client</p>
                            <p>{order.customerName}</p>
                            <p>{order.customerPhone}</p>
                            <p>{order.customerCity}</p>
                            <p>{order.customerAddress}</p>
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300">
                            <div className="flex justify-between text-[11px] font-black mb-2">
                                <span>Produit</span>
                                <span>Total</span>
                            </div>

                            <div className="space-y-2">
                                {order.items?.map((item, index) => {
                                    const lineTotal = Number(item.qty || 0) * Number(item.price || 0);
                                    return (
                                        <div key={`${item.title}-${index}`} className="space-y-1">
                                            <div className="font-semibold break-words">{item.title}</div>
                                            <div className="flex justify-between text-[11px] text-slate-700">
                                                <span>
                                                    {item.qty} × {Number(item.price || 0).toLocaleString()} dh
                                                </span>
                                                <span>{lineTotal.toLocaleString()} dh</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span>{subtotal.toLocaleString()} dh</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Livraison</span>
                                <span>+{Number(order.shipping || 0).toLocaleString()} dh</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Remise</span>
                                <span>-{Number(order.discount || 0).toLocaleString()} dh</span>
                            </div>
                            <div className="flex justify-between text-[14px] font-black pt-1">
                                <span>Total</span>
                                <span>{Number(order.total || 0).toLocaleString()} dh</span>
                            </div>
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">Paiement</span>
                                <span>{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">Livraison</span>
                                <span>{order.delivery_type === "delivery" ? "Delivery" : "Store Pickup"}</span>
                            </div>
                        </div>

                        <div className="py-3 border-b border-dashed border-slate-300">
                            <p className="font-black mb-1">Garantie</p>
                            <p className="text-[11px] leading-relaxed">{getWarrantyText(order)}</p>
                        </div>

                        {order.notes ? (
                            <div className="py-3 border-b border-dashed border-slate-300">
                                <p className="font-black mb-1">Notes</p>
                                <p className="text-[11px] leading-relaxed break-words">{order.notes}</p>
                            </div>
                        ) : null}

                        <div className="pt-3 text-center">
                            <p className="font-semibold">Merci pour votre confiance</p>
                            <p className="text-[11px] mt-1">
                                {settings?.invoiceFooter || "Merci pour votre achat."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}