import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Se houver token, clona a requisição injetando o cabeçalho Authorization
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRoute =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');

      // Se der 401 ou 403 em rotas protegidas (token inválido ou expirado), limpa a sessão e vai para o login
      if ((error.status === 401 || error.status === 403) && !isAuthRoute) {
        authService.logout();
        router.navigate(['/login'], { replaceUrl: true });
      }

      return throwError(() => error);
    }),
  );
};
