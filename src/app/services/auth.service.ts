// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap, filter, take, delay } from 'rxjs/operators';
import { Router } from '@angular/router';

import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse 
} from '../models/user.inteface';
import { StorageService } from './StorageService';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    console.log('[AuthService] Vérification initiale de l\'état d\'authentification');
    
    if (!this.storageService.hasValidToken()) {
      console.log('[AuthService] Aucun token valide, initialisation terminée');
      this.clearAuthState();
      this.isInitializedSubject.next(true);
      return;
    }

    // Token valide trouvé, vérifier avec le serveur
    console.log('[AuthService] Token valide trouvé, vérification serveur');
    this.getCurrentUser().subscribe({
      next: (userData) => {
        console.log('[AuthService] Utilisateur restauré avec succès:', userData.nom);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
        this.isInitializedSubject.next(true);
      },
      error: (error) => {
        console.warn('[AuthService] Token invalide côté serveur, nettoyage');
        this.clearAuthState();
        this.isInitializedSubject.next(true);
      }
    });
  }

  waitForInitialization(): Observable<boolean> {
    return this.isInitialized$.pipe(
      filter(initialized => initialized === true),
      take(1)
    );
  }

  waitForAuth(): Observable<boolean> {
    return this.waitForInitialization().pipe(
      switchMap(() => this.isAuthenticated$),
      take(1)
    );
  }

  private clearAuthState(): void {
    this.storageService.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // CORRIGÉ: Connexion avec délai pour synchronisation
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('[AuthService] Connexion réussie:', response);
          this.storageService.setToken(response.access_token);
          this.storageService.setTokenType(response.token_type);
          this.storageService.setExpiresIn(response.expires_in);
        }),
        // IMPORTANT: Petit délai pour permettre la synchronisation
        delay(30),
        switchMap(response => {
          // Récupérer les infos utilisateur immédiatement après la connexion
          return this.getCurrentUser().pipe(
            tap(() => {
              // Mettre à jour l'état d'authentification APRÈS avoir récupéré l'utilisateur
              this.isAuthenticatedSubject.next(true);
            }),
            map(() => response) // Retourner la réponse originale
          );
        }),
        catchError(error => {
          console.error('[AuthService] Erreur de connexion:', error);
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(error => {
          console.error('[AuthService] Erreur d\'inscription:', error);
          return throwError(() => error);
        })
      );
  }

  // CORRIGÉ: Sans headers manuels (l'intercepteur s'en charge)
  getCurrentUser(): Observable<User> {
    if (!this.storageService.hasValidToken()) {
      console.warn('[AuthService] Aucun token valide pour récupérer l\'utilisateur');
      return throwError(() => new Error('No valid token available'));
    }

    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          console.log('[AuthService] Utilisateur récupéré:', user.nom);
          this.storageService.setUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('[AuthService] Erreur lors de la récupération utilisateur:', error);
          if (error.status === 401) {
            this.logout(false);
          }
          return throwError(() => error);
        })
      );
  }

  logout(navigate: boolean = true): void {
    const hasToken = this.storageService.hasValidToken();
    
    if (hasToken) {
      // Tentative de déconnexion côté serveur (sans headers, l'intercepteur s'en charge)
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        complete: () => {
          console.log('[AuthService] Déconnexion côté serveur réussie');
          this.performLogout(navigate);
        },
        error: (error) => {
          console.warn('[AuthService] Erreur déconnexion serveur:', error);
          this.performLogout(navigate);
        }
      });
    } else {
      this.performLogout(navigate);
    }
  }

  private performLogout(navigate: boolean = true): void {
    console.log('[AuthService] Nettoyage de l\'état d\'authentification');
    this.clearAuthState();
    if (navigate) {
      this.router.navigate(['/login']);
    }
  }

  // CORRIGÉ: Sans headers manuels
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(
        tap(response => {
          console.log('[AuthService] Token rafraîchi');
          this.storageService.setToken(response.access_token);
          this.storageService.setExpiresIn(response.expires_in);
        }),
        catchError(error => {
          console.error('[AuthService] Erreur rafraîchissement token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Vérifications utiles
  isAuthenticated(): boolean {
    const isValid = this.storageService.hasValidToken();
    const debugInfo = this.storageService.getAuthDebugInfo();
    
    console.log('[AuthService] Vérification auth:', {
      authentifié: isValid,
      debug: debugInfo
    });
    
    return isValid;
  }

  isInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  // NOUVEAU: Méthode pour vérifier l'expiration
  isTokenExpired(): boolean {
    return this.storageService.isTokenExpired();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isClient(): boolean {
    return this.hasRole('client');
  }

  // NOUVEAU: Méthode de debug
  getAuthDebugInfo(): any {
    return {
      ...this.storageService.getAuthDebugInfo(),
      isInitialized: this.isInitialized(),
      currentUser: this.getCurrentUserValue()?.nom || null
    };
  }
}