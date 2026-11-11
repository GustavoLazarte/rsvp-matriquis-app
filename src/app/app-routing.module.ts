import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'select-event',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/event-select/event-select.module').then((m) => m.EventSelectModule),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'rsvp/:token',
    loadChildren: () => import('./pages/invi/invi.module').then((m) => m.InviModule),
  },
  {
    path: 'platform-admin',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/platform-admin/platform-admin.module').then((m) => m.PlatformAdminModule),
  },
  {
    path: 'org-admin',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/org-admin/org-admin.module').then((m) => m.OrgAdminModule),
  },
  {
    path: 'templates',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/templates/templates.module').then((m) => m.TemplatesModule),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
