import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomePageComponent } from './pages/admin-home-page/admin-home-page.component';

@NgModule({
  declarations: [AdminHomePageComponent],
  imports: [SharedModule, ReactiveFormsModule, AdminRoutingModule],
})
export class AdminModule {}
