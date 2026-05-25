import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent {
  @Input() tempPhotos: string[] = [];

  @Output() fileSelected = new EventEmitter<Event>();
  @Output() removePhoto = new EventEmitter<number>();
}
