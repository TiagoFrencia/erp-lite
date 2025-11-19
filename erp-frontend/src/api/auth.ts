// ==========================
//   src/api/auth.ts
// ==========================

import api from "./client";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
};

export type UserProfile = {
  username: string;
  roles: string[];
  name?: string;
  email?: string;
};

// ===== LOGIN =====
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

// ===== PERFIL DEL USUARIO =====
export async function me(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/auth/me");
  return response.data;
}

// ===== LOGOUT =====
// El backend es stateless, así que esto es opcional.
// Si tenés un endpoint, lo dejamos sin romperlo.
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // En JWT stateless puede fallar sin romper nada
  }
}
