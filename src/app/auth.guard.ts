// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    if (this.authService.isAuthenticated()) {
      // Vérifier les rôles si spécifiés dans la route
      const expectedRoles = route.data['roles'] as string[];
      if (expectedRoles) {
        const user = this.authService.getCurrentUserValue();
        if (user && expectedRoles.includes(user.role)) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      return true;
    }

    // Rediriger vers la page de connexion avec l'URL de retour
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

// Guard pour les utilisateurs non authentifiés (pour login/register)
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // Rediriger vers le dashboard si déjà connecté
    this.router.navigate(['/dashboard']);
    return false;
  }
}