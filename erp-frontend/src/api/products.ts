// ==========================
//  src/api/products.ts
// ==========================

import api from "./client";

// --------- Tipos ---------
export type Product = {
  id: number;
  name: string;
  sku: string;

  // precios y costos
  costPrice?: number;
  profitMargin?: number;
  salePrice?: number;

  // stock
  stock: number;
  stockMin?: number;

  // info adicional
  category?: string;
  description?: string;
  barcode?: string;
  imageUrl?: string;

  // campos "legacy" que podés seguir usando si ya están en el front
  price?: number;
  reorderPoint?: number;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
};

// Payload que mandamos al backend (ProductRequest compatible)
export type ProductPayload = {
  name: string;
  sku: string;
  price: number;      // sigue existiendo en el DTO
  stock: number;
  active: boolean;

  category?: string;
  description?: string;
  barcode?: string;
  imageUrl?: string;

  costPrice?: number;
  profitMargin?: number;
  salePrice?: number;
  stockMin?: number;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

// --------- Listar productos (paginado + filtros) ---------
export async function fetchProducts(params: {
  q?: string;
  page?: number; // 0-based
  size?: number;

  // filtros "legacy"
  stockLt?: number; // stock < X
  stockGt?: number; // stock > X

  // nuevos filtros alineados al backend
  minStock?: number;
  active?: boolean;
}): Promise<Page<Product>> {
  const {
    q,
    page = 0,
    size = 10,
    stockLt,
    stockGt,
    minStock,
    active,
  } = params;

  const response = await api.get("/products", {
    params: {
      q,
      page,
      size,
      stockLt,   // el backend los va a ignorar si no los usa
      stockGt,   // idem, los dejamos para no romper nada
      minStock,  // este sí lo usa tu ProductController
      active,    // idem
    },
  });

  const data = response.data as any;

  return {
    content: Array.isArray(data.content) ? (data.content as Product[]) : [],
    totalPages: data.totalPages ?? 1,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? 10,
  };
}

// --------- Crear producto (JSON, no multipart) ---------
export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await api.post("/products", payload);
  return response.data;
}

// --------- Actualizar producto (JSON, no multipart) ---------
export async function updateProduct(
  id: number,
  payload: ProductPayload
): Promise<Product> {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
}

// --------- Obtener producto por ID ---------
export async function getProduct(id: number): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

// --------- Eliminar producto ---------
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

// --------- Exportar CSV (lista de productos genérica) ---------
export async function exportProductsCSV(params: {
  q?: string;
  stockLt?: number;
  stockGt?: number;
}): Promise<Blob> {
  const response = await api.get("/products/export/csv", {
    params,
    responseType: "blob",
  });

  return response.data;
}

// --------- Exportar CSV para pantalla de Stock ---------
export async function exportStockCSV(params: {
  q?: string;
  onlyLow?: boolean;
  threshold?: number;
}): Promise<Blob> {
  const { q, onlyLow, threshold } = params;

  const response = await api.get("/products/export/csv", {
    params: {
      q,
      stockLt: onlyLow ? threshold : undefined,
    },
    responseType: "blob",
  });

  return response.data as Blob;
}

// --------- Listado de stock bajo ---------
export async function fetchLowStockProducts(
  threshold: number
): Promise<Product[]> {
  const response = await api.get("/products/low-stock", {
    params: { threshold },
  });

  return response.data;
}

// --------- Actualizar stock directo (setear valor absoluto) ---------
export async function updateProductStock(id: number, newStock: number) {
  const response = await api.patch(`/products/${id}/stock`, {
    stock: newStock,
  });

  return response.data;
}

// --------- Ajustar stock (IN / OUT) usado por StockPage ---------
export async function adjustStock(payload: {
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  note?: string;
}) {
  const response = await api.post(
    `/products/${payload.productId}/adjust-stock`,
    {
      type: payload.type,
      quantity: payload.quantity,
      note: payload.note,
    }
  );

  return response.data;
}

// --------- Obtener métricas de productos (dashboard) ---------
export async function getProductsStats(): Promise<{
  totalProducts: number;
  lowStockCount: number;
}> {
  const response = await api.get("/products/stats");
  return response.data;
}

// --------- Obtener cantidad de productos con stock bajo ---------
//   - Si viene threshold => usa /products/low-stock?threshold=X y cuenta
//   - Si NO viene => usa las stats generales (lowStockCount)
export async function getLowStockCount(threshold?: number): Promise<number> {
  // Caso con umbral explícito (como en Sidebar: getLowStockCount(5))
  if (typeof threshold === "number") {
    const response = await api.get("/products/low-stock", {
      params: { threshold },
    });
    const list = response.data as Product[];
    return Array.isArray(list) ? list.length : 0;
  }

  // Caso sin parámetro: usar stats globales
  const stats = await getProductsStats();
  return stats.lowStockCount ?? 0;
}
