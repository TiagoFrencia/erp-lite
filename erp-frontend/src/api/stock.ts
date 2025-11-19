// ==========================
//  src/api/stock.ts
// ==========================

import api from "./client";
import { Product, Page } from "./products";

// ----- Obtener productos con bajo stock -----
export async function fetchLowStock(params: {
  q?: string;
  page?: number;
  size?: number;
  threshold?: number;   // umbral (default 5)
}): Promise<Page<Product>> {
  const { q, page = 0, size = 10, threshold = 5 } = params;

  const res = await api.get("/products", {
    params: {
      q,
      page,
      size,
      stockLt: threshold, // filtrado verdadero
    },
  });

  const data = res.data;

  return {
    content: Array.isArray(data.content) ? data.content : [],
    totalPages: data.totalPages ?? 1,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? 10,
  };
}

// ----- Exportar CSV de stock -----
export async function exportStockCSV(params: {
  q?: string;
  threshold?: number;
}): Promise<Blob> {
  const { q, threshold = 5 } = params;

  const r = await api.get("/products/export/csv", {
    params: {
      q,
      stockLt: threshold,
    },
    responseType: "blob",
  });

  return r.data;
}

// ----- Actualizar stock de producto -----
export async function updateStock(id: number, newStock: number) {
  const r = await api.patch(`/products/${id}/stock`, {
    stock: newStock,
  });

  return r.data;
}
