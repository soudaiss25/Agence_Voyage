// src/app/services/StorageService.ts
import { Injectable } from '@angular/core';
import { User } from '../models/user.inteface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly TOKEN_TYPE_KEY = 'token_type';
  private readonly EXPIRES_AT_KEY = 'expires_at';
  private readonly USER_KEY = 'user_data';

  constructor() {}

  // Token management
  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('[StorageService] Token sauvegardé');
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        console.log('[StorageService] Token récupéré:', token.substring(0, 20) + '...');
      } else {
        console.log('[StorageService] Aucun token trouvé');
      }
      return token;
    }
    return null;
  }

  // Token type management
  setTokenType(tokenType: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
    }
  }

  getTokenType(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_TYPE_KEY);
    }
    return null;
  }

  // Expiration management - CORRIGÉ
  setExpiresIn(expiresInSeconds: number): void {
    if (typeof localStorage !== 'undefined') {
      // Calculer le timestamp d'expiration (maintenant + expiresIn secondes)
      const expiresAt = Date.now() + (expiresInSeconds * 1000);
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
      console.log('[StorageService] Expiration définie à:', new Date(expiresAt).toLocaleString());
    }
  }

  getExpiresAt(): number | null {
    if (typeof localStorage !== 'undefined') {
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
      return expiresAt ? parseInt(expiresAt) : null;
    }
    return null;
  }

  // Vérification d'expiration - CORRIGÉE
  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      console.log('[StorageService] Aucune date d\'expiration trouvée');
      return true;
    }

    const now = Date.now();
    const isExpired = now >= expiresAt;
    
    if (isExpired) {
      console.warn('[StorageService] Token expiré:', {
        maintenant: new Date(now).toLocaleString(),
        expiration: new Date(expiresAt).toLocaleString()
      });
    } else {
      const remainingMinutes = Math.floor((expiresAt - now) / 60000);
      console.log(`[StorageService] Token valide encore ${remainingMinutes} minutes`);
    }
    
    return isExpired;
  }

  // User data management
  setUser(user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('[StorageService] Données utilisateur sauvegardées:', user.nom);
    }
  }

  getUser(): User | null {
    if (typeof localStorage !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          const user = JSON.parse(userData) as User;
          console.log('[StorageService] Données utilisateur récupérées:', user.nom);
          return user;
        } catch (error) {
          console.error('[StorageService] Erreur lors du parsing des données utilisateur:', error);
          this.clearAuthData();
          return null;
        }
      }
    }
    return null;
  }

  // Clear all auth data
  clearAuthData(): void {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove = [
        this.TOKEN_KEY,
        this.TOKEN_TYPE_KEY,
        this.EXPIRES_AT_KEY,
        this.USER_KEY
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('[StorageService] Toutes les données d\'authentification supprimées');
    }
  }

  // Utility methods
  hasValidToken(): boolean {
    const token = this.getToken();
    const isExpired = this.isTokenExpired();
    
    const isValid = token !== null && !isExpired;
    console.log('[StorageService] Token valide:', isValid);
    
    return isValid;
  }

  // Get auth header value
  getAuthHeaderValue(): string | null {
    const token = this.getToken();
    const tokenType = this.getTokenType() || 'Bearer';
    
    if (token && !this.isTokenExpired()) {
      return `${tokenType} ${token}`;
    }
    
    return null;
  }

  // Debug info
  getAuthDebugInfo(): any {
    return {
      hasToken: !!this.getToken(),
      tokenType: this.getTokenType(),
      expiresAt: this.getExpiresAt(),
      isExpired: this.isTokenExpired(),
      hasUser: !!this.getUser(),
      isValid: this.hasValidToken()
    };
  }
}