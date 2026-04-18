import { v4 as uuidv4 } from "uuid";

export type Product = {
  id: number;
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string;
  tags: string[] | null;
  description: string | null;
  specs: { label: string; value: string }[] | null;
  images: string[] | null;
  hoverImage: string | null;
  rating: number;
  reviews: number;
  isPromotion: boolean;
  isPack: boolean;
  packGroup: string | null;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OrderItem = {
  image: string;
  title: string;
  qty: number;
  price: number;
};

export type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  paymentMethod: string;
  items: OrderItem[] | null;
  source?: "offline" | "online";
  delivery_type?: "store_pickup" | "delivery";
  notes?: string | null;
  created_by?: string | null;
  printed_at?: string | null;
  order_code?: string | null;
  customer_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  shipping?: number;
  discount?: number;
  source?: "offline" | "online";
  delivery_type?: "store_pickup" | "delivery";
  notes?: string;
  created_by?: string;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  city: string;
  address?: string | null;
  totalOrders: number;
  lastOrderDate: string | null;
};

export type Settings = {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string | null;
  shippingFee: number;
  codDeposit: number;
  theme: string;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  invoiceFooter?: string | null;
};

export type Profile = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  hoverImage?: string;
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
  inStock?: boolean;
  description?: string;
  specs?: Record<string, string>;
};

const API_BASE_URL = "";

const KEYS = {
  SETTINGS: "em_settings",
  PROFILE: "em_profile",
  AUTH: "em_auth",
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 150));

const seedLocalData = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const settings: Settings = {
      id: 1,
      storeName: "ELECTRO MANAGER",
      phone: "+212 600 123 456",
      email: "contact@electromanager.com",
      address1: "Tech Boulevard, Casablanca",
      address2: null,
      shippingFee: 0,
      codDeposit: 0,
      theme: "light",
      website: "",
      instagram: "",
      facebook: "",
      invoiceFooter: "Merci pour votre confiance.",
    };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  if (!localStorage.getItem(KEYS.PROFILE)) {
    const profile: Profile = {
      displayName: "Moustpha Admin",
      email: "moustpha@electromanager.com",
      avatarUrl: null,
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Réponse JSON invalide depuis ${url}`);
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function normalizeProduct(raw: any): Product {
  return {
    id: Number(raw.id),
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    brand: raw.brand ?? "",
    category: raw.category ?? "",
    price: Number(raw.price ?? 0),
    compareAtPrice:
      raw.compareAtPrice !== undefined
        ? raw.compareAtPrice === null
          ? null
          : Number(raw.compareAtPrice)
        : raw.compare_at_price === undefined || raw.compare_at_price === null
          ? null
          : Number(raw.compare_at_price),
    stock: Number(raw.stock ?? 0),
    sku: raw.sku ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    description: raw.description ?? null,
    specs: Array.isArray(raw.specs) ? raw.specs : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    hoverImage:
      raw.hoverImage !== undefined ? raw.hoverImage ?? null : raw.hover_image ?? null,
    rating: raw.rating === undefined || raw.rating === null ? 5 : Number(raw.rating),
    reviews: raw.reviews === undefined || raw.reviews === null ? 0 : Number(raw.reviews),
    isPromotion:
      raw.isPromotion !== undefined ? Boolean(raw.isPromotion) : Boolean(raw.is_promotion),
    isPack: raw.isPack !== undefined ? Boolean(raw.isPack) : Boolean(raw.is_pack),
    packGroup: raw.packGroup !== undefined ? raw.packGroup ?? null : raw.pack_group ?? null,
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : raw.is_active !== false,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function normalizeProducts(raw: any[]): Product[] {
  return (raw ?? []).map(normalizeProduct);
}

function normalizeOrder(raw: any): Order {
  return {
    id: Number(raw.id),
    customerName: raw.customerName ?? raw.customer_name ?? "",
    customerPhone: raw.customerPhone ?? raw.customer_phone ?? "",
    customerCity: raw.customerCity ?? raw.customer_city ?? "",
    customerAddress: raw.customerAddress ?? raw.customer_address ?? "",
    date:
      typeof (raw.date ?? raw.created_at) === "string"
        ? raw.date ?? raw.created_at
        : new Date(raw.date ?? raw.created_at ?? new Date()).toISOString(),
    status: raw.status ?? "New",
    total: Number(raw.total ?? 0),
    subtotal: Number(raw.subtotal ?? 0),
    shipping: Number(raw.shipping ?? 0),
    discount: Number(raw.discount ?? 0),
    paymentMethod: raw.paymentMethod ?? raw.payment_method ?? "Cash",
    items: Array.isArray(raw.items) ? raw.items : [],
    source: raw.source ?? "offline",
    delivery_type: raw.delivery_type ?? "store_pickup",
    notes: raw.notes ?? null,
    created_by: raw.created_by ?? null,
    printed_at: raw.printed_at ?? null,
    order_code: raw.order_code ?? null,
    customer_id:
      raw.customer_id === undefined || raw.customer_id === null
        ? null
        : Number(raw.customer_id),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function normalizeOrders(raw: any[]): Order[] {
  return (raw ?? []).map(normalizeOrder);
}

function normalizeCustomer(raw: any): Customer {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    phone: raw.phone ?? "",
    city: raw.city ?? "",
    address: raw.address ?? "",
    totalOrders: Number(raw.totalOrders ?? raw.total_orders ?? 0),
    lastOrderDate: raw.lastOrderDate ?? raw.last_order_date ?? null,
  };
}

function normalizeCustomers(raw: any[]): Customer[] {
  return (raw ?? []).map(normalizeCustomer);
}

function normalizeSettings(raw: any): Settings {
  return {
    id: Number(raw.id ?? 1),
    storeName: raw.storeName ?? raw.store_name ?? "ELECTRO MANAGER",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    address1: raw.address1 ?? raw.address_1 ?? "",
    address2: raw.address2 ?? raw.address_2 ?? null,
    shippingFee: Number(raw.shippingFee ?? raw.shipping_fee ?? 0),
    codDeposit: Number(raw.codDeposit ?? raw.cod_deposit ?? 0),
    theme: raw.theme ?? "light",
    website: raw.website ?? null,
    instagram: raw.instagram ?? null,
    facebook: raw.facebook ?? null,
    invoiceFooter: raw.invoiceFooter ?? raw.invoice_footer ?? null,
  };
}

export const api = {
  init: () => seedLocalData(),

  login: async (email: string) => {
    await delay();
    localStorage.setItem(KEYS.AUTH, "true");
    const p = api.getProfileSync();
    if (p) {
      p.email = email;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    }
    return { success: true };
  },

  logout: async () => {
    await delay();
    localStorage.removeItem(KEYS.AUTH);
  },

  isAuthenticated: () => localStorage.getItem(KEYS.AUTH) === "true",

  getProfileSync: (): Profile =>
    JSON.parse(
      localStorage.getItem(KEYS.PROFILE) ||
      '{"displayName":"Admin","email":"admin@test.com","avatarUrl":null}'
    ),

  getProfile: async (): Promise<Profile> => {
    await delay();
    return api.getProfileSync();
  },

  updateProfile: async (data: Partial<Profile>) => {
    await delay();
    const current = api.getProfileSync();
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  getProducts: async (): Promise<Product[]> => {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/products`);
    return normalizeProducts(data);
  },

  getProduct: async (id: number): Promise<Product | null> => {
    try {
      const data = await fetchJson<any>(`${API_BASE_URL}/api/products/${id}`);
      return normalizeProduct(data);
    } catch {
      return null;
    }
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    const created = await fetchJson<any>(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    return normalizeProduct(created);
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const updated = await fetchJson<any>(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return normalizeProduct(updated);
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },

  importStoreProducts: async (storeProducts: StoreProduct[]) => {
    return await fetchJson<{
      message: string;
      createdCount: number;
      skippedCount: number;
      created: Product[];
      skipped: { id: string; name: string; reason: string }[];
    }>(`${API_BASE_URL}/api/products/import-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeProducts),
    });
  },

  getOrders: async (): Promise<Order[]> => {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/orders`);
    return normalizeOrders(data);
  },

  createOrder: async (input: CreateOrderInput): Promise<Order> => {
    const items = Array.isArray(input.items) ? input.items : [];
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    );
    const shipping = Number(input.shipping ?? 0);
    const discount = Number(input.discount ?? 0);
    const total = Math.max(subtotal + shipping - discount, 0);

    const payload = {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerCity: input.customerCity,
      customerAddress: input.customerAddress,
      status: input.status,
      total,
      subtotal,
      shipping,
      discount,
      paymentMethod: input.paymentMethod,
      items,
      source: input.source ?? "offline",
      delivery_type: input.delivery_type ?? "store_pickup",
      notes: input.notes ?? "",
      created_by: input.created_by ?? "admin",
    };

    const created = await fetchJson<any>(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return normalizeOrder(created);
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const currentOrder = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`);

    const updated = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentOrder,
        status,
      }),
    });

    return normalizeOrder(updated);
  },

  markOrderPrinted: async (id: number): Promise<Order> => {
    const currentOrder = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`);

    const updated = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentOrder,
        printed_at: new Date().toISOString(),
      }),
    });

    return normalizeOrder(updated);
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const data = await fetchJson<any[]>(`${API_BASE_URL}/api/customers`);
      return normalizeCustomers(data);
    } catch {
      const orders = await api.getOrders();
      const map = new Map<string, Customer>();

      for (const order of orders) {
        const key = `${order.customerName}__${order.customerPhone}`;
        if (!map.has(key)) {
          map.set(key, {
            id: order.id,
            name: order.customerName,
            phone: order.customerPhone,
            city: order.customerCity,
            address: order.customerAddress,
            totalOrders: 1,
            lastOrderDate: order.date,
          });
        } else {
          const current = map.get(key)!;
          current.totalOrders += 1;
          if (!current.lastOrderDate || new Date(order.date) > new Date(current.lastOrderDate)) {
            current.lastOrderDate = order.date;
          }
        }
      }

      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.lastOrderDate || 0).getTime() - new Date(a.lastOrderDate || 0).getTime()
      );
    }
  },

  getSettings: async (): Promise<Settings> => {
    try {
      const data = await fetchJson<any>(`${API_BASE_URL}/api/settings`);
      return normalizeSettings(data);
    } catch {
      await delay();
      return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || "{}");
    }
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    try {
      const payload = {
        store_name: data.storeName,
        phone: data.phone,
        email: data.email,
        address_1: data.address1,
        address_2: data.address2,
        shipping_fee: data.shippingFee,
        cod_deposit: data.codDeposit,
        theme: data.theme,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        invoice_footer: data.invoiceFooter,
      };

      const updated = await fetchJson<any>(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return normalizeSettings(updated);
    } catch {
      await delay();
      const current = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || "{}");
      const updated = { ...current, ...data };
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    }
  },

  getAnalytics: async () => {
    const orders = await api.getOrders();
    const products = await api.getProducts();

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todaySales = orders
      .filter((o) => o.date.startsWith(today))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const monthSales = orders
      .filter((o) => {
        const d = new Date(o.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const yearSales = orders
      .filter((o) => {
        const d = new Date(o.date);
        return d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10).length;
    const totalProducts = products.length;
    const totalOrders = orders.length;

    return {
      kpis: {
        todaySales: todaySales || 0,
        monthSales: monthSales || 0,
        yearSales: yearSales || 0,
        totalRevenue: totalRevenue || 0,
        totalOrders,
        totalProducts,
        lowStock,
      },
      orders,
      products,
    };
  },
};