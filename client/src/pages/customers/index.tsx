import { useMemo, useState } from "react";
import { useCustomers, useOrders } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";
import {
  Search,
  Phone,
  MapPin,
  Users,
  TrendingUp,
  ShoppingBag,
  ChevronRight,
  Star,
  Calendar,
  FileText,
  Truck,
  Store,
  CreditCard,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { AvatarGen } from "@/components/avatar-gen";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "../dashboard";

function getDeliveryLabel(deliveryType?: string) {
  return deliveryType === "delivery" ? "Delivery" : "Store Pickup";
}

export default function CustomersList() {
  const { data: customers, isLoading: cLoading } = useCustomers();
  const { data: allOrders, isLoading: oLoading } = useOrders();

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeOrders = Array.isArray(allOrders) ? allOrders : [];

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return safeCustomers
      .filter((c: any) => {
        const name = String(c?.name ?? "").toLowerCase();
        const phone = String(c?.phone ?? "");
        const city = String(c?.city ?? "").toLowerCase();
        const address = String(c?.address ?? "").toLowerCase();

        return (
          name.includes(q) ||
          phone.includes(search.trim()) ||
          city.includes(q) ||
          address.includes(q)
        );
      })
      .sort((a: any, b: any) => {
        const aD = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        const bD = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
        return bD - aD;
      });
  }, [safeCustomers, search]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];

    return safeOrders
      .filter(
        (o: any) =>
          o.customerName === selectedCustomer.name &&
          o.customerPhone === selectedCustomer.phone
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [safeOrders, selectedCustomer]);

  const totalSpend = customerOrders.reduce(
    (s: number, o: any) => s + Number(o.total ?? 0),
    0
  );

  const deliveredCount = customerOrders.filter(
    (o: any) => String(o.status).toLowerCase() === "delivered"
  ).length;

  const lastOrder = customerOrders[0] ?? null;

  if (cLoading || oLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-1">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes pageIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideR {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes gradDrift {
          0%,100% { background-position:0% 50%; }
          50% { background-position:100% 50%; }
        }
        @keyframes pulseDot {
          0%,100% { transform:scale(1); opacity:1; }
          50% { transform:scale(1.6); opacity:.5; }
        }
        @keyframes sheetSlide {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes avatarPop {
          0%   { transform:scale(.85); opacity:0; }
          70%  { transform:scale(1.05); }
          100% { transform:scale(1); opacity:1; }
        }

        .page-in  { animation: pageIn  .5s cubic-bezier(.22,1,.36,1) both; }
        .slide-r  { animation: slideR  .4s cubic-bezier(.22,1,.36,1) both; }
        .sheet-in { animation: sheetSlide .4s cubic-bezier(.22,1,.36,1) both; }
        .avatar-pop { animation: avatarPop .5s cubic-bezier(.22,1,.36,1) both; }

        .header-grad {
          background: linear-gradient(120deg,#f8faff 0%,#eef2ff 45%,#f0fdf4 100%);
          background-size:200% 200%;
          animation: gradDrift 8s ease infinite;
        }

        .cust-row {
          transition: background .15s ease, transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease;
        }
        .cust-row:hover {
          background: linear-gradient(90deg,rgba(99,102,241,.05) 0%,transparent 100%);
          transform: translateX(3px);
        }

        .cust-row:hover .row-avatar {
          box-shadow: 0 0 0 3px rgba(99,102,241,.25);
          transform: scale(1.08);
        }
        .row-avatar { transition: box-shadow .2s ease, transform .2s ease; }

        .cust-row:hover .orders-badge {
          transform: scale(1.12);
        }
        .orders-badge { transition: transform .2s cubic-bezier(.22,1,.36,1); }

        .search-wrap:focus-within {
          box-shadow: 0 0 0 3px rgba(99,102,241,.15);
          border-color: rgba(99,102,241,.4);
        }

        .detail-card { transition: box-shadow .25s ease; }
        .detail-card:hover { box-shadow: 0 8px 30px -8px rgba(99,102,241,.12); }

        .order-item { transition: background .15s ease, transform .2s ease; }
        .order-item:hover { background: rgba(99,102,241,.04); transform:translateX(2px); }

        .pulse-dot { animation: pulseDot 2s ease infinite; }

        .stat-pill {
          transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease;
        }
        .stat-pill:hover { transform:translateY(-2px); box-shadow:0 6px 20px -4px rgba(0,0,0,.1); }
      `}</style>

      <div className="space-y-5 pb-12 px-0.5">
        <div className="page-in header-grad relative overflow-hidden rounded-3xl border border-indigo-100/60 p-6 md:p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-violet-100/30 blur-xl pointer-events-none" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-600 mb-3 shadow-sm">
                <Users className="w-3 h-3" />
                Customers Management
              </div>
              <h1 className="text-2xl md:text-[1.85rem] font-black tracking-tight text-slate-800">
                All Customers
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Browse, search, and view complete customer details and offline order history.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="stat-pill flex items-center gap-2 rounded-2xl bg-white/80 border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm cursor-default">
                <TrendingUp className="w-4 h-4" />
                {safeCustomers.length} customers
              </div>
              <div className="stat-pill flex items-center gap-2 rounded-2xl bg-white/80 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live data
              </div>
            </div>
          </div>
        </div>

        <div className="page-in" style={{ animationDelay: "60ms" }}>
          <div className="search-wrap flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl p-2 shadow-sm transition-all duration-300 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone, city or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium placeholder:text-slate-400"
              />
            </div>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div
          className="page-in rounded-2xl border border-slate-100 bg-white/95 backdrop-blur shadow-sm overflow-hidden"
          style={{ animationDelay: "100ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {["Customer", "Contact", "Location", "Address", "Orders", "Last Order", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 ${i === 4 ? "text-center" : i === 5 ? "text-right" : "text-left"
                          }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {filteredCustomers.map((customer: any, idx: number) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="cust-row cursor-pointer group slide-r"
                    style={{ animationDelay: `${100 + idx * 35}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="row-avatar rounded-full shrink-0">
                          <AvatarGen email={customer.name} className="w-9 h-9" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-none">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Customer</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-xs font-medium">{customer.phone}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600">
                          {customer.city}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 max-w-[220px]">
                      <span className="text-xs font-medium text-slate-500 truncate block">
                        {customer.address || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="orders-badge inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs border border-indigo-100">
                        {customer.totalOrders}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-semibold text-slate-500">
                        {customer.lastOrderDate ? (
                          format(new Date(customer.lastOrderDate), "MMM dd, yyyy")
                        ) : (
                          <span className="text-slate-300">Never</span>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-semibold">No customers found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {filteredCustomers.length > 0 && (
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-black text-slate-600">{filteredCustomers.length}</span>{" "}
                of <span className="font-black text-slate-600">{safeCustomers.length}</span>{" "}
                customers
              </p>
            </div>
          )}
        </div>
      </div>

      <Sheet
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <SheetContent className="w-full sm:max-w-md border-l border-slate-200/60 shadow-2xl p-0 flex flex-col bg-slate-50/95 backdrop-blur">
          {selectedCustomer && (
            <div className="sheet-in flex flex-col h-full">
              <div className="relative overflow-hidden bg-white border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 pointer-events-none" />
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-100/50 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col items-center text-center pt-8 pb-6 px-6">
                  <div className="avatar-pop mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 blur-md opacity-30 scale-110" />
                    <AvatarGen
                      email={selectedCustomer.name}
                      className="w-24 h-24 text-3xl relative shadow-xl ring-4 ring-white"
                    />
                  </div>

                  <SheetTitle className="text-2xl font-black text-slate-800 tracking-tight">
                    {selectedCustomer.name}
                  </SheetTitle>

                  <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedCustomer.city}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-5 w-full">
                    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 py-3 px-4 text-center cursor-default stat-pill">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                        Orders
                      </p>
                      <p className="text-xl font-black text-indigo-600">
                        {selectedCustomer.totalOrders}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 py-3 px-4 text-center cursor-default stat-pill">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                        Spend
                      </p>
                      <p className="text-base font-black text-emerald-600">
                        {totalSpend.toLocaleString()} dh
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 border border-blue-100 py-3 px-4 text-center cursor-default stat-pill">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                        Delivered
                      </p>
                      <p className="text-base font-black text-blue-600">
                        {deliveredCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Customer Info
                    </h3>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/60">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">
                        {selectedCustomer.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-violet-50/60 rounded-xl border border-violet-100/60">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-500 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">
                        {selectedCustomer.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <UserCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-sm text-slate-700">
                        {selectedCustomer.address || "No address recorded"}
                      </span>
                    </div>
                  </div>
                </div>

                {lastOrder && (
                  <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Last Order Snapshot
                      </h3>
                      <span className="text-xs font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        {lastOrder.order_code || `#${lastOrder.id}`}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="font-semibold text-slate-700">
                          {format(new Date(lastOrder.date), "MMM dd, yyyy")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <StatusBadge status={lastOrder.status} />
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment</span>
                        <span className="font-semibold text-slate-700">
                          {lastOrder.paymentMethod}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivery</span>
                        <span className="font-semibold text-slate-700">
                          {getDeliveryLabel(lastOrder.delivery_type)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-3">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="font-black text-slate-900">
                          {Number(lastOrder.total || 0).toLocaleString()} dh
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Order History
                    </h3>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full">
                      {customerOrders.length} total
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100/80 max-h-[340px] overflow-y-auto">
                    {customerOrders.length > 0 ? (
                      customerOrders.map((order: any, i: number) => (
                        <div
                          key={order.id}
                          className="order-item p-4 slide-r"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-3 h-3" />
                              </div>
                              <span className="font-black text-sm text-slate-700">
                                {order.order_code || `#${order.id}`}
                              </span>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>

                          <div className="pl-8 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(order.date), "MMM dd, yyyy")}
                              </div>
                              <span className="font-black text-sm text-slate-800">
                                {Number(order.total || 0).toLocaleString()} dh
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                <CreditCard className="w-3 h-3" />
                                {order.paymentMethod}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                {order.delivery_type === "delivery" ? (
                                  <Truck className="w-3 h-3" />
                                ) : (
                                  <Store className="w-3 h-3" />
                                )}
                                {getDeliveryLabel(order.delivery_type)}
                              </div>
                            </div>

                            {Array.isArray(order.items) && order.items.length > 0 && (
                              <div className="pt-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                  Items
                                </p>
                                <div className="space-y-1">
                                  {order.items.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2.5 py-2"
                                    >
                                      <div className="flex items-center gap-2 text-slate-600 min-w-0">
                                        <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                          {item.title} × {item.qty}
                                        </span>
                                      </div>
                                      <span className="font-semibold text-slate-700 shrink-0">
                                        {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString()} dh
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <ShoppingBag className="w-8 h-8 mb-2 opacity-25" />
                        <p className="text-sm font-semibold">No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCustomer.lastOrderDate && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100 cursor-default">
                    <Star className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">
                      Last active on{" "}
                      <span className="font-black">
                        {format(
                          new Date(selectedCustomer.lastOrderDate),
                          "MMMM dd, yyyy"
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}