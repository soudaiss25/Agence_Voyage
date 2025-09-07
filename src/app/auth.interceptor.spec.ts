// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './services/auth.service';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('[AuthInterceptor] Interception de la requête:', req.url);

    // Ajouter le token si disponible
    const authReq = this.addTokenHeader(req);
    
    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.warn('[AuthInterceptor] Erreur 401 détectée:', req.url);
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (token && !this.authService.isTokenExpired()) {
      console.log('[AuthInterceptor] Ajout du token à la requête:', request.url);
      return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
    }
    
    console.log('[AuthInterceptor] Pas de token valide pour:', request.url);
    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('[AuthInterceptor] Tentative de rafraîchissement du token');
      
      if (this.authService.getToken()) {
        return this.authService.refreshToken().pipe(
          switchMap(() => {
            console.log('[AuthInterceptor] Token rafraîchi avec succès');
            this.isRefreshing = false;
            this.refreshTokenSubject.next(this.authService.getToken());
            return next.handle(this.addTokenHeader(request));
          }),
          catchError((err) => {
            console.error('[AuthInterceptor] Échec du rafraîchissement, déconnexion');
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        // Pas de token à rafraîchir, déconnecter
        console.warn('[AuthInterceptor] Pas de token à rafraîchir, déconnexion');
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('Token expiré'));
      }
    }

    // Si déjà en cours de rafraîchissement, attendre
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(this.addTokenHeader(request)))
    );
  }

  private isTokenExpired(): boolean {
    // Utiliser la méthode du StorageService
    return this.authService.isTokenExpired();
  }
}