import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./pages/agenda/agenda.page').then((m) => m.AgendaPage),
      },
      {
        path: 'tarefas',
        loadComponent: () =>
          import('./pages/task-form/task-form.page').then(
            (m) => m.TaskFormPage,
          ),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes.page').then(
            (m) => m.ConfiguracoesPage,
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
