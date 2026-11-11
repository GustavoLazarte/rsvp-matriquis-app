import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/guards/auth.guard';
import { OrgAdminComponent } from './org-admin.component';

const routes: Routes = [
  { path: '', component: OrgAdminComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), OrgAdminComponent]
})
export class OrgAdminModule { }
