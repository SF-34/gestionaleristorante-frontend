import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { RoleId } from './core/models/role-id.enum';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'customer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [RoleId.Customer, RoleId.Admin] },
    loadChildren: () =>
      import('./features/customer/customer.module').then((m) => m.CustomerModule),
  },
  {
    path: 'kitchen',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [RoleId.Kitchen, RoleId.Admin] },
    loadChildren: () =>
      import('./features/kitchen/kitchen.module').then((m) => m.KitchenModule),
  },
  {
    path: 'sala',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [RoleId.Sala, RoleId.Admin] },
    loadChildren: () =>
      import('./features/sala/sala.module').then((m) => m.SalaModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [RoleId.Admin] },
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: '**',
    redirectTo: 'menu',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
