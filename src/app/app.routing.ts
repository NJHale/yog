import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ProjectComponent } from './components/project/project.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'project/:namespace',
    component: ProjectComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
