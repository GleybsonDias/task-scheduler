import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se já estiver com sessão iniciada, barra o acesso e envia para a home
  if (authService.isAuthenticated()) {
    router.navigate(['/home'], { replaceUrl: true });
    return false;
  }

  return true;
};
