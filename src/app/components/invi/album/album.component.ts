import { Component, Input, OnChanges, SimpleChanges, inject, computed } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { AlbumImageService } from '../../../services/album-image.service';
import { AlbumImageStateService } from '../../../core/services/album-image-state.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent implements OnChanges {
  @Input() rsvpEvent: Event | null = null;

  private albumService = inject(AlbumImageService);
  private albumState = inject(AlbumImageStateService);
  currentIndex: number | null = null;

  constructor(public i18n: I18nService) {}

  readonly albumImages = this.albumState.images;
  readonly displayImages = computed(() => this.albumImages().slice(0, 6));
  readonly totalCount = computed(() => this.albumImages().length);

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['rsvpEvent'] && this.rsvpEvent?.id) {
      await this.albumService.loadByEvent(this.rsvpEvent.id);
    }
  }

  openLightbox(index: number) {
    this.currentIndex = index;
  }

  closeLightbox() {
    this.currentIndex = null;
  }

  prev() {
    if (this.currentIndex === null) return;
    const len = this.albumImages().length;
    if (len === 0) return;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : len - 1;
  }

  next() {
    if (this.currentIndex === null) return;
    const len = this.albumImages().length;
    if (len === 0) return;
    this.currentIndex = this.currentIndex < len - 1 ? this.currentIndex + 1 : 0;
  }

  caption(img: { caption_es: string | null; caption_en: string | null }): string {
    return this.i18n.current === 'es'
      ? (img.caption_es || '')
      : (img.caption_en || '');
  }
}
