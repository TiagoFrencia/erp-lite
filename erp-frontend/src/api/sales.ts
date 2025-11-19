// ==========================
//   src/api/sales.ts
// ==========================

import api from "./client";

// --------- Tipos ---------
export type SaleItem = {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
  subtotal?: number;
};

export type Sale = {
  id: number;
  customerName: string;
  total: number;
  date: string; // ISO
  items: SaleItem[];
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // página actual (0-based)
  size: number; // tamaño de página
};

// --------- Obtener ventas (paginado + filtros) ---------
export async function fetchSales(params: {
  page?: number;
  size?: number;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
}): Promise<Page<Sale>> {
  const {
    page = 0,
    size = 10,
    customer,
    dateFrom,
    dateTo,
    minTotal,
  } = params;

  const response = await api.get("/sales", {
    params: {
      page,
      size,
      customer,
      dateFrom,
      dateTo,
      minTotal,
    },
  });

  const data = response.data as any;

  // 🔧 Adaptamos lo que viene del backend (SaleResponse) al tipo Sale del front
  const rawContent = Array.isArray(data.content) ? data.content : [];

  const content: Sale[] = rawContent.map((item: any) => {
    const rawItems = Array.isArray(item.items) ? item.items : [];

    const items: SaleItem[] = rawItems.map((it: any) => ({
      id: it.id ?? undefined,
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      // unitPrice en el backend -> price en el front
      price: it.price ?? it.unitPrice ?? 0,
      subtotal:
        it.subtotal ??
        it.total ??
        (it.quantity && (it.price ?? it.unitPrice)
          ? it.quantity * (it.price ?? it.unitPrice)
          : undefined),
    }));

    return {
      // saleId en el backend -> id en el front
      id: item.id ?? item.saleId ?? 0,
      customerName: item.customerName ?? "",
      total: item.total ?? 0,
      // createdAt en el backend -> date en el front
      date: item.date ?? item.createdAt ?? "",
      items,
    };
  });

  return {
    content,
    totalPages: data.totalPages ?? 1,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? 10,
  };
}

// --------- Obtener venta por ID ---------
export async function fetchSaleById(id: number): Promise<Sale> {
  const response = await api.get(`/sales/${id}`);
  const item = response.data as any;

  const rawItems = Array.isArray(item.items) ? item.items : [];

  const items: SaleItem[] = rawItems.map((it: any) => ({
    id: it.id ?? undefined,
    productId: it.productId,
    productName: it.productName,
    quantity: it.quantity,
    price: it.price ?? it.unitPrice ?? 0,
    subtotal:
      it.subtotal ??
      it.total ??
      (it.quantity && (it.price ?? it.unitPrice)
        ? it.quantity * (it.price ?? it.unitPrice)
        : undefined),
  }));

  return {
    id: item.id ?? item.saleId ?? 0,
    customerName: item.customerName ?? "",
    total: item.total ?? 0,
    date: item.date ?? item.createdAt ?? "",
    items,
  };
}

// --------- Crear venta ---------
export async function createSale(payload: {
  customerName: string;
  items: { productId: number; quantity: number }[];
}): Promise<Sale> {
  const response = await api.post("/sales", payload);
  const item = response.data as any;

  const rawItems = Array.isArray(item.items) ? item.items : [];

  const items: SaleItem[] = rawItems.map((it: any) => ({
    id: it.id ?? undefined,
    productId: it.productId,
    productName: it.productName,
    quantity: it.quantity,
    price: it.price ?? it.unitPrice ?? 0,
    subtotal:
      it.subtotal ??
      it.total ??
      (it.quantity && (it.price ?? it.unitPrice)
        ? it.quantity * (it.price ?? it.unitPrice)
        : undefined),
  }));

  return {
    id: item.id ?? item.saleId ?? 0,
    customerName: item.customerName ?? "",
    total: item.total ?? 0,
    date: item.date ?? item.createdAt ?? "",
    items,
  };
}

// --------- Exportar CSV ---------
export async function exportSalesCSV(params: {
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
}): Promise<Blob> {
  const response = await api.get("/sales/export/csv", {
    params,
    responseType: "blob",
  });

  return response.data as Blob;
}

// --------- Exportar PDF ---------
export async function exportSalesPDF(params: {
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
}): Promise<Blob> {
  const response = await api.get("/sales/export/pdf", {
    params,
    responseType: "blob",
  });

  return response.data as Blob;
}
