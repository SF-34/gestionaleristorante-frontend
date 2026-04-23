import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerRoutingModule } from './customer-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CustomerHomePageComponent } from './pages/customer-home-page/customer-home-page.component';

@NgModule({
  declarations: [CustomerHomePageComponent],
  imports: [SharedModule, ReactiveFormsModule, CustomerRoutingModule],
})
export class CustomerModule {}
