import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[]; // par exemple ['admin', 'enseignant']
  const user = authService.getCurrentUser();

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  // Si l'utilisateur n'est pas autorisé
  router.navigate(['/unauthorized']);
  return false;
};
