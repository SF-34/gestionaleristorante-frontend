import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaHomePageComponent } from './pages/sala-home-page/sala-home-page.component';

const routes: Routes = [
  {
    path: '',
    component: SalaHomePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalaRoutingModule {}
