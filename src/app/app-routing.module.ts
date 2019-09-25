import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {HomeGuard} from './guards/home/home.guard';
import {DoubleAuthGuard} from './guards/double-auth/double-auth.guard';
import {LoginGuard} from './guards/login/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule',
    canActivate: [HomeGuard]
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        loadChildren: './pages/auth/login/login.module#LoginPageModule'
      },
      {
        path: 'double-home',
        loadChildren: './pages/auth/double-auth/double-auth.module#DoubleAuthPageModule',
        canActivate: [DoubleAuthGuard]
      },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
