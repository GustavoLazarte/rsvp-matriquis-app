import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { EventStateService } from '../../../core/services/event-state.service';
import { SupabaseStorageService } from '../../../core/services/supabase-storage.service';

@Component({
  standalone: false,
  selector: 'app-invi-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  uploading = false;
  uploadSuccess = false;
  uploadError = '';

  constructor(
    public i18n: I18nService,
    private eventState: EventStateService,
    private storage: SupabaseStorageService,
  ) {}

  openWhatsApp() {
    const msg = this.i18n.current === 'es'
      ? 'Hola, les enviamos fotos de su boda'
      : 'Hi, sending you wedding photos!';
    window.open(`https://wa.me/59169530474?text=${encodeURIComponent(msg)}`);
  }

  triggerFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      await this.uploadFiles(Array.from(files));
    };
    input.click();
  }

  private async uploadFiles(files: File[]) {
    const eventId = this.eventState.currentEvent()?.id;
    if (!eventId) return;

    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    try {
      for (const file of files) {
        await this.storage.upload(eventId, file);
      }
      this.uploadSuccess = true;
    } catch (err: any) {
      this.uploadError = err?.message || 'Error al subir las fotos';
    } finally {
      this.uploading = false;
    }
  }
}
