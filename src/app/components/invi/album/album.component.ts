import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent implements OnInit {
  currentIndex: number | null = null;
  photoGrads = [
    'linear-gradient(135deg,#d4e4d8,#b8d4be)',
    'linear-gradient(135deg,#e8f0eb,#d4e4d8)',
    'linear-gradient(135deg,#c8dcd0,#b8d4be)',
    'linear-gradient(135deg,#d4e4d8,#c8dcd0)',
    'linear-gradient(135deg,#e8f0eb,#d4e4d8)',
    'linear-gradient(135deg,#b8d4be,#a8c4ae)',
  ];

  constructor(public i18n: I18nService) {}

  ngOnInit() {}

  openLightbox(index: number) {
    this.currentIndex = index;
  }

  closeLightbox() {
    this.currentIndex = null;
  }

  prev() {
    if (this.currentIndex === null) return;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.photoGrads.length - 1;
  }

  next() {
    if (this.currentIndex === null) return;
    this.currentIndex = this.currentIndex < this.photoGrads.length - 1 ? this.currentIndex + 1 : 0;
  }
}
