import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/guards/auth.guard';
import { PlatformAdminComponent } from './platform-admin.component';

const routes: Routes = [
  { path: '', component: PlatformAdminComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), PlatformAdminComponent]
})
export class PlatformAdminModule { }
