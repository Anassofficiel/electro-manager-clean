import "dotenv/config";
import { supabase } from "./supabase";
import {
  type Product,
  type InsertProduct,
  type UpdateProductRequest,
  type Order,
  type InsertOrder,
  type UpdateOrderRequest,
  type Customer,
  type InsertCustomer,
  type Settings,
  type UpdateSettingsRequest,
} from "@shared/schema";

export interface IStorage {
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: number,
    updates: UpdateProductRequest
  ): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(
    id: number,
    updates: UpdateOrderRequest
  ): Promise<Order | undefined>;

  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
}

// ─── helpers: products ────────────────────────────────────────────────────────
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    sku: row.sku,
    tags: row.tags ?? [],
    description: row.description ?? null,
    specs: row.specs ?? [],
    images: row.images ?? [],
    hoverImage: row.hover_image ?? null,
    rating: row.rating ?? 5,
    reviews: row.reviews ?? 0,
    isPromotion: row.is_promotion ?? false,
    isPack: row.is_pack ?? false,
    packGroup: row.pack_group ?? null,
    isActive: row.is_active ?? true,
    created_at: row.created_at ? new Date(row.created_at) : null,
    updated_at: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function mapInsertProductToRow(product: InsertProduct) {
  return {
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    stock: product.stock,
    sku: product.sku,
    tags: product.tags ?? [],
    description: product.description ?? null,
    specs: product.specs ?? [],
    images: product.images ?? [],
    hover_image: product.hoverImage ?? null,
    rating: product.rating ?? 5,
    reviews: product.reviews ?? 0,
    is_promotion: product.isPromotion ?? false,
    is_pack: product.isPack ?? false,
    pack_group: product.packGroup ?? null,
    is_active: product.isActive ?? true,
  };
}

function mapUpdateProductToRow(product: UpdateProductRequest) {
  const updates: Record<string, any> = {};

  if (product.title !== undefined) updates.title = product.title;
  if (product.slug !== undefined) updates.slug = product.slug;
  if (product.brand !== undefined) updates.brand = product.brand;
  if (product.category !== undefined) updates.category = product.category;
  if (product.price !== undefined) updates.price = product.price;
  if (product.compareAtPrice !== undefined) {
    updates.compare_at_price = product.compareAtPrice;
  }
  if (product.stock !== undefined) updates.stock = product.stock;
  if (product.sku !== undefined) updates.sku = product.sku;
  if (product.tags !== undefined) updates.tags = product.tags;
  if (product.description !== undefined) updates.description = product.description;
  if (product.specs !== undefined) updates.specs = product.specs;
  if (product.images !== undefined) updates.images = product.images;
  if (product.hoverImage !== undefined) updates.hover_image = product.hoverImage;
  if (product.rating !== undefined) updates.rating = product.rating;
  if (product.reviews !== undefined) updates.reviews = product.reviews;
  if (product.isPromotion !== undefined) updates.is_promotion = product.isPromotion;
  if (product.isPack !== undefined) updates.is_pack = product.isPack;
  if (product.packGroup !== undefined) updates.pack_group = product.packGroup;
  if (product.isActive !== undefined) updates.is_active = product.isActive;

  return updates;
}

// ─── helpers: orders ──────────────────────────────────────────────────────────
function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerCity: row.customer_city,
    customerAddress: row.customer_address,
    date: row.date ? new Date(row.date) : new Date(),
    status: row.status,
    total: row.total,
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount ?? 0,
    paymentMethod: row.payment_method,
    items: row.items ?? [],
    source: row.source ?? "offline",
    delivery_type: row.delivery_type ?? "store_pickup",
    notes: row.notes ?? null,
    created_by: row.created_by ?? null,
    printed_at: row.printed_at ? new Date(row.printed_at) : null,
    order_code: row.order_code ?? null,
    customer_id: row.customer_id ?? null,
  } as Order;
}

function mapInsertOrderToRow(order: InsertOrder) {
  return {
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_city: order.customerCity,
    customer_address: order.customerAddress,
    status: order.status,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount ?? 0,
    payment_method: order.paymentMethod,
    items: order.items ?? [],
    source: (order as any).source ?? "offline",
    delivery_type: (order as any).delivery_type ?? "store_pickup",
    notes: (order as any).notes ?? null,
    created_by: (order as any).created_by ?? null,
    printed_at: (order as any).printed_at ?? null,
    order_code: (order as any).order_code ?? null,
    customer_id: (order as any).customer_id ?? null,
  };
}

function mapUpdateOrderToRow(order: UpdateOrderRequest) {
  const updates: Record<string, any> = {};

  if (order.customerName !== undefined) updates.customer_name = order.customerName;
  if (order.customerPhone !== undefined) updates.customer_phone = order.customerPhone;
  if (order.customerCity !== undefined) updates.customer_city = order.customerCity;
  if (order.customerAddress !== undefined) updates.customer_address = order.customerAddress;
  if (order.status !== undefined) updates.status = order.status;
  if (order.total !== undefined) updates.total = order.total;
  if (order.subtotal !== undefined) updates.subtotal = order.subtotal;
  if (order.shipping !== undefined) updates.shipping = order.shipping;
  if (order.discount !== undefined) updates.discount = order.discount;
  if (order.paymentMethod !== undefined) updates.payment_method = order.paymentMethod;
  if (order.items !== undefined) updates.items = order.items;

  if ((order as any).source !== undefined) updates.source = (order as any).source;
  if ((order as any).delivery_type !== undefined) {
    updates.delivery_type = (order as any).delivery_type;
  }
  if ((order as any).notes !== undefined) updates.notes = (order as any).notes;
  if ((order as any).created_by !== undefined) {
    updates.created_by = (order as any).created_by;
  }
  if ((order as any).printed_at !== undefined) {
    updates.printed_at = (order as any).printed_at;
  }
  if ((order as any).order_code !== undefined) {
    updates.order_code = (order as any).order_code;
  }
  if ((order as any).customer_id !== undefined) {
    updates.customer_id = (order as any).customer_id;
  }

  return updates;
}

// ─── helpers: customers ───────────────────────────────────────────────────────
function mapCustomerRow(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    city: row.city,
    address: row.address ?? "",
    totalOrders: row.total_orders ?? 0,
    lastOrderDate: row.last_order_date ? new Date(row.last_order_date) : null,
  } as Customer;
}

// ─── helpers: settings ────────────────────────────────────────────────────────
function mapSettingsRow(row: any): Settings {
  return {
    id: row.id,
    storeName: row.store_name,
    phone: row.phone,
    email: row.email,
    address1: row.address_1,
    address2: row.address_2 ?? null,
    shippingFee: row.shipping_fee ?? 0,
    codDeposit: row.cod_deposit ?? 0,
    theme: row.theme ?? "light",
    website: row.website ?? null,
    instagram: row.instagram ?? null,
    facebook: row.facebook ?? null,
    invoiceFooter: row.invoice_footer ?? null,
  } as Settings;
}

function mapUpdateSettingsToRow(settings: UpdateSettingsRequest) {
  const updates: Record<string, any> = {};

  if (settings.storeName !== undefined) updates.store_name = settings.storeName;
  if (settings.phone !== undefined) updates.phone = settings.phone;
  if (settings.email !== undefined) updates.email = settings.email;
  if (settings.address1 !== undefined) updates.address_1 = settings.address1;
  if (settings.address2 !== undefined) updates.address_2 = settings.address2;
  if (settings.shippingFee !== undefined) updates.shipping_fee = settings.shippingFee;
  if (settings.codDeposit !== undefined) updates.cod_deposit = settings.codDeposit;
  if (settings.theme !== undefined) updates.theme = settings.theme;

  if ((settings as any).website !== undefined) updates.website = (settings as any).website;
  if ((settings as any).instagram !== undefined) {
    updates.instagram = (settings as any).instagram;
  }
  if ((settings as any).facebook !== undefined) {
    updates.facebook = (settings as any).facebook;
  }
  if ((settings as any).invoiceFooter !== undefined) {
    updates.invoice_footer = (settings as any).invoiceFooter;
  }

  return updates;
}

export class MemStorage implements IStorage {
  // Products (Supabase)
  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapProductRow(data);
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapProductRow);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const payload = mapInsertProductToRow(insertProduct);

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return mapProductRow(data);
  }

  async updateProduct(
    id: number,
    updates: UpdateProductRequest
  ): Promise<Product | undefined> {
    const payload = mapUpdateProductToRow(updates);

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapProductRow(data);
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }

  // Orders (Supabase)
  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapOrderRow(data);
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapOrderRow);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const payload = mapInsertOrderToRow(insertOrder);

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return mapOrderRow(data);
  }

  async updateOrder(
    id: number,
    updates: UpdateOrderRequest
  ): Promise<Order | undefined> {
    const payload = mapUpdateOrderToRow(updates);

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapOrderRow(data);
  }

  // Customers (Supabase table)
  async getCustomer(id: number): Promise<Customer | undefined> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapCustomerRow(data);
  }

  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("last_order_date", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapCustomerRow);
  }

  async createCustomer(_insertCustomer: InsertCustomer): Promise<Customer> {
    throw new Error(
      "Creating customers directly is not supported. Customers are synced from orders."
    );
  }

  // Settings (Supabase)
  async getSettings(): Promise<Settings | undefined> {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapSettingsRow(data);
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const payload = mapUpdateSettingsToRow(updates);

    const { data: existing, error: existingError } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (!existing) {
      const insertPayload = {
        id: 1,
        store_name: (updates as any).storeName ?? "ELECTRO MANAGER",
        phone: updates.phone ?? "",
        email: updates.email ?? "",
        address_1: (updates as any).address1 ?? "",
        address_2: (updates as any).address2 ?? null,
        shipping_fee: (updates as any).shippingFee ?? 0,
        cod_deposit: (updates as any).codDeposit ?? 0,
        theme: updates.theme ?? "light",
        website: (updates as any).website ?? null,
        instagram: (updates as any).instagram ?? null,
        facebook: (updates as any).facebook ?? null,
        invoice_footer: (updates as any).invoiceFooter ?? null,
      };

      const { data, error } = await supabase
        .from("settings")
        .insert([insertPayload])
        .select("*")
        .single();

      if (error) throw error;
      return mapSettingsRow(data);
    }

    const { data, error } = await supabase
      .from("settings")
      .update(payload)
      .eq("id", 1)
      .select("*")
      .single();

    if (error) throw error;

    return mapSettingsRow(data);
  }
}

export const storage = new MemStorage();