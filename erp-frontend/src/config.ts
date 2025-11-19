/**
 * Utilidad para obtener la URL base de la API del backend.
 *
 * - Lee VITE_API_BASE_URL desde las variables de entorno de Vite.
 * - Si no está definida, usa http://localhost:8081/api como fallback.
 * - Normaliza para que SIEMPRE termine en "/api" y sin barras dobles.
 *
 * Ejemplos de .env:
 *   VITE_API_BASE_URL=http://localhost:8081/api
 *   VITE_API_BASE_URL=https://erp-backend.onrender.com/api
 */

const RAW_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "http://localhost:8081/api";

// Quitamos barras finales sobrantes para evitar "///"
const NORMALIZED_BASE = RAW_BASE_URL.replace(/\/+$/, "");

// Nos aseguramos de que termine en "/api"
export const API_BASE_URL = NORMALIZED_BASE.endsWith("/api")
  ? NORMALIZED_BASE
  : `${NORMALIZED_BASE}/api`;

/**
 * Función helper por si en algún punto querés
 * consumir la base desde otros módulos.
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
