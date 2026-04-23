import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SalaRoutingModule } from './sala-routing.module';
import { SalaHomePageComponent } from './pages/sala-home-page/sala-home-page.component';

@NgModule({
  declarations: [SalaHomePageComponent],
  imports: [SharedModule, ReactiveFormsModule, SalaRoutingModule],
})
export class SalaModule {}
