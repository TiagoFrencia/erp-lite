// ==========================
//  src/api/client.ts
// ==========================

import axios, { AxiosRequestHeaders } from "axios";
import { API_BASE_URL } from "../config"; // 👈 usamos la misma base que en config.ts

const LOGIN_PATH = "/login";

// =========================
//  Axios instance
// =========================

const api = axios.create({
  baseURL: API_BASE_URL, // viene normalizada desde config.ts y termina en /api
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
//  Helpers
// =========================

const TOKEN_KEY = "token";
const USER_KEY = "user";

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

// =========================
//  REQUEST Interceptor
// =========================

api.interceptors.request.use(
  (config) => {
    config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

    const token = getToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
//  RESPONSE Interceptor
// =========================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthStorage();

      if (window.location.pathname !== LOGIN_PATH) {
        window.location.replace(LOGIN_PATH);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
