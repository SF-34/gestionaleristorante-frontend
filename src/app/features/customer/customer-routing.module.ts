import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomePageComponent } from './pages/customer-home-page/customer-home-page.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerHomePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
