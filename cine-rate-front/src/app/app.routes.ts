import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/pages/login/login.page').then(m => m.LoginPage) },
  { path: 'home', loadComponent: () => import('./components/pages/home/home.page').then(m => m.HomePage) },
  { path: 'activity', loadComponent: () => import('./components/pages/activity/activity.page').then(m => m.ActivityPage) },
  { path: 'movie/:id', loadComponent: () => import('./components/pages/movie-detail/movie-detail.page').then(m => m.MovieDetailPage) },
  { path: 'profile', loadComponent: () => import('./components/pages/profile/profile.page').then(m => m.ProfilePage) },
  { path: 'profile/edit', loadComponent: () => import('./components/pages/profile-edit/profile-edit.page').then(m => m.ProfileEditPage) }
];