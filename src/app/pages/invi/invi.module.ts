import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { InviComponent } from './invi.component';
import { TickerComponent } from '../../components/invi/ticker/ticker.component';
import { HeroComponent } from '../../components/invi/hero/hero.component';
import { StoryComponent } from '../../components/invi/story/story.component';
import { AlbumComponent } from '../../components/invi/album/album.component';
import { TimelineComponent } from '../../components/invi/timeline/timeline.component';
import { LogisticsComponent } from '../../components/invi/logistics/logistics.component';
import { WeatherComponent } from '../../components/invi/weather/weather.component';
import { DresscodeComponent } from '../../components/invi/dresscode/dresscode.component';
import { GiftsComponent } from '../../components/invi/gifts/gifts.component';
import { UploadComponent } from '../../components/invi/upload/upload.component';
import { RsvpFormComponent } from '../../components/invi/rsvp-form/rsvp-form.component';
import { InviFooterComponent } from '../../components/invi/footer/footer.component';
import { FloatingComponent } from '../../components/invi/floating/floating.component';

const routes: Routes = [{ path: '', component: InviComponent }];

@NgModule({
  declarations: [
    InviComponent,
    TickerComponent,
    HeroComponent,
    StoryComponent,
    AlbumComponent,
    TimelineComponent,
    LogisticsComponent,
    WeatherComponent,
    DresscodeComponent,
    GiftsComponent,
    UploadComponent,
    RsvpFormComponent,
    InviFooterComponent,
    FloatingComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InviModule {}
