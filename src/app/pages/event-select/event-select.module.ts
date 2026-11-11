import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventSelectComponent } from './event-select.component';

const routes: Routes = [{ path: '', component: EventSelectComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), EventSelectComponent],
})
export class EventSelectModule {}
