// Tipos alineados con tu backend

export type PageableResponse<T> = {
  content: T[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  sort?: string
}

export type Product = {
  id: number
  sku?: string | null
  name: string
  costPrice?: number | null
  salePrice: number
  stock: number
  stockMin?: number | null
}

export type Customer = {
  id: number
  name: string
}

export type SaleItemResponse = {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type SaleResponse = {
  saleId: number
  customerName: string
  createdAt: string
  total: number
  items: SaleItemResponse[]
}

// Requests
export type CreateCustomerRequest = { name: string }
export type CreateSaleItemRequest = { productId: number; quantity: number }
export type CreateSaleRequest = { customerName: string; items: CreateSaleItemRequest[] }

// Paginación
export type PageParams = { page: number; size: number; sort?: string }
