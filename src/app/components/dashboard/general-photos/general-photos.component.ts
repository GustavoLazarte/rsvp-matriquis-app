import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { EventImage } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-general-photos',
  templateUrl: './general-photos.component.html',
  styleUrls: ['./general-photos.component.scss'],
})
export class GeneralPhotosComponent {
  @Input() photos: EventImage[] = [];

  @Output() addFiles = new EventEmitter<Event>();
  @Output() removePhoto = new EventEmitter<string>();
}
