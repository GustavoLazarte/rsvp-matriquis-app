import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/guards/auth.guard';
import { TemplatesComponent } from './templates.component';

const routes: Routes = [
  { path: '', component: TemplatesComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), TemplatesComponent]
})
export class TemplatesModule { }
