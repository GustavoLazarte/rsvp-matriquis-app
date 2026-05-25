import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/dashboard/topbar/topbar.component';
import { OverviewComponent } from '../../components/dashboard/overview/overview.component';
import { GuestsComponent } from '../../components/dashboard/guests/guests.component';
import { GalleryComponent } from '../../components/dashboard/gallery/gallery.component';
import { SettingsComponent } from '../../components/dashboard/settings/settings.component';
import { SharedModule } from '../../components/shared.module';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    TopbarComponent,
    OverviewComponent,
    GuestsComponent,
    GalleryComponent,
    SettingsComponent,
  ],
  imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardModule {}
