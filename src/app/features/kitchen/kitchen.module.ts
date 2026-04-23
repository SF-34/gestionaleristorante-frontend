import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { KitchenRoutingModule } from './kitchen-routing.module';
import { KitchenHomePageComponent } from './pages/kitchen-home-page/kitchen-home-page.component';

@NgModule({
  declarations: [KitchenHomePageComponent],
  imports: [SharedModule, ReactiveFormsModule, KitchenRoutingModule],
})
export class KitchenModule {}
