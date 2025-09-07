// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/StorageService';


@Injectable()
export class authInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token aux requêtes si disponible
    const authReq = this.addTokenHeader(req, this.storageService.getToken());
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si l'erreur est 401 (Unauthorized)
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (token && !this.storageService.isTokenExpired()) {
      return request.clone({
        headers: request.headers.set('Authorization', `${this.storageService.getTokenType()} ${token}`)
      });
    }
    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this.storageService.getToken();
      
      if (token) {
        return this.authService.refreshToken().pipe(
          switchMap((tokenResponse: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(tokenResponse.access_token);
            
            return next.handle(this.addTokenHeader(request, tokenResponse.access_token));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => error);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }
}