import api from './client';

/** ===== Tipos ===== */

export type Customer = {
  id?: number | string;
  name: string;
  cuit?: string;      // para Factura A
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  active?: boolean;   // 👈 NUEVO: requerido por el backend
  createdAt?: string;
  updatedAt?: string;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // página actual (0-based)
  size: number;   // tamaño de página
};

export type FetchCustomersParams = {
  q?: string;     // búsqueda por nombre, email, etc.
  page?: number;  // 0-based
  size?: number;  // tamaño de página
};

/** ===== Listar clientes (paginado + búsqueda) ===== */

export async function fetchCustomers(
  params: FetchCustomersParams = {}
): Promise<Page<Customer>> {
  const resp = await api.get<Page<Customer>>('/customers', { params });
  const data: any = resp.data ?? {};

  const content = Array.isArray(data.content) ? data.content : [];

  const totalPages = Number.isFinite(data.totalPages)
    ? data.totalPages
    : 1;

  const totalElements = Number.isFinite(data.totalElements)
    ? data.totalElements
    : content.length;

  const number = Number.isFinite(data.number) ? data.number : (params.page ?? 0);

  const size = Number.isFinite(data.size)
    ? data.size
    : (params.size ?? (content.length || 10));

  return {
    content,
    totalPages,
    totalElements,
    number,
    size,
  };
}

/** ===== Crear / Actualizar cliente ===== */

export async function createCustomer(payload: Customer): Promise<Customer> {
  const resp = await api.post<Customer>('/customers', payload);
  return resp.data;
}

export async function updateCustomer(
  id: number | string,
  payload: Customer
): Promise<Customer> {
  const resp = await api.put<Customer>(`/customers/${id}`, payload);
  return resp.data;
}

/** ===== Export CSV (si el backend lo soporta) ===== */

export async function exportCustomersCSV(params: { q?: string } = {}): Promise<Blob> {
  const resp = await api.get('/customers/export/csv', {
    params,
    responseType: 'blob',
  });
  return resp.data as Blob;
}
