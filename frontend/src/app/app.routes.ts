import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'invitation/:id',
    loadComponent: () => import('./pages/invitation-view/invitation-view.component').then(m => m.InvitationViewComponent)
  },
  {
    path: 'rsvp/:id',
    loadComponent: () => import('./pages/rsvp/rsvp.component').then(m => m.RsvpComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'invitations',
        loadComponent: () => import('./pages/admin/invitations/invitations.component').then(m => m.InvitationsComponent)
      },
      {
        path: 'invitations/new',
        loadComponent: () => import('./pages/admin/invitation-form/invitation-form.component').then(m => m.InvitationFormComponent)
      },
      {
        path: 'invitations/edit/:id',
        loadComponent: () => import('./pages/admin/invitation-form/invitation-form.component').then(m => m.InvitationFormComponent)
      },
      {
        path: 'guests',
        loadComponent: () => import('./pages/admin/guests/guests.component').then(m => m.GuestsComponent)
      },
      {
        path: 'guests/:invitationId',
        loadComponent: () => import('./pages/admin/guests/guests.component').then(m => m.GuestsComponent)
      },
      {
        path: 'themes',
        loadComponent: () => import('./pages/admin/themes/themes.component').then(m => m.ThemesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
