// src/app/models/user.interface.ts
export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  role: string;
  telephone: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  login: string;
  motDePasse: string;
  role: string;
  telephone: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiResponse<T> {
  message?: string;
  user?: T;
  error?: string;
}