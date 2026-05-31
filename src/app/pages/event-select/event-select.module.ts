import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EventSelectComponent } from './event-select.component';

const routes: Routes = [{ path: '', component: EventSelectComponent }];

@NgModule({
  declarations: [EventSelectComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class EventSelectModule {}
