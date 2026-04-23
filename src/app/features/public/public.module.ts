import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { MenuPageComponent } from './pages/menu-page/menu-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { ForbiddenPageComponent } from './pages/forbidden-page/forbidden-page.component';
import { ChangePasswordFirstLoginPageComponent } from './pages/change-password-first-login-page/change-password-first-login-page.component';

@NgModule({
  declarations: [
    MenuPageComponent,
    LoginPageComponent,
    SignupPageComponent,
    ForbiddenPageComponent,
    ChangePasswordFirstLoginPageComponent,
  ],
  imports: [SharedModule, ReactiveFormsModule, PublicRoutingModule],
})
export class PublicModule {}
