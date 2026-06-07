import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { AlbumImage } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-album-manager',
  templateUrl: './album-manager.component.html',
  styleUrls: ['./album-manager.component.scss'],
})
export class AlbumManagerComponent {
  @Input() albumImages: AlbumImage[] = [];
  @Input() uploading = false;
  @Input() savingCaptionId: string | null = null;

  @Output() addFiles = new EventEmitter<Event>();
  @Output() removeImage = new EventEmitter<string>();
  @Output() updateCaption = new EventEmitter<{ id: string; captionEs: string; captionEn: string }>();
  @Output() moveUp = new EventEmitter<number>();
  @Output() moveDown = new EventEmitter<number>();

  editId: string | null = null;
  editCaptionEs = '';
  editCaptionEn = '';

  startEdit(img: AlbumImage) {
    this.editId = img.id;
    this.editCaptionEs = img.caption_es || '';
    this.editCaptionEn = img.caption_en || '';
  }

  cancelEdit() {
    this.editId = null;
    this.editCaptionEs = '';
    this.editCaptionEn = '';
  }

  saveEdit() {
    if (!this.editId) return;
    this.updateCaption.emit({
      id: this.editId,
      captionEs: this.editCaptionEs,
      captionEn: this.editCaptionEn,
    });
    this.editId = null;
  }
}
