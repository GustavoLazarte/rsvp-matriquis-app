import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { SupabaseStorageService } from '../../../core/services/supabase-storage.service';
import { EventStateService } from '../../../core/services/event-state.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Output() save = new EventEmitter<typeof this.formData>();

  private eventService = inject(EventService);
  private storage = inject(SupabaseStorageService);
  private eventState = inject(EventStateService);

  saving = false;
  uploadingLogo = false;
  uploadingAdress = false;

  readonly events = this.eventState.events;
  readonly currentEvent = this.eventState.currentEvent;

  formData!: Event;
  timeHour = '16';
  timeMinute = '00';

  hours: string[] = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes: string[] = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  ngOnInit() {
    this.formData = { ...this.currentEvent() } as Event;
    const t = this.formData?.event_date?.slice(11, 16);
    if (t) {
      this.timeHour = t.split(':')[0];
      this.timeMinute = t.split(':')[1];
    }
  }

  private syncEventDate() {
    const date = this.formData?.event_date?.slice(0, 10) || '2026-01-01';
    this.formData.event_date = `${date}T${this.timeHour}:${this.timeMinute}:00.000Z`;
  }

  onDateChange(date: string) {
    this.syncEventDate();
  }

  onTimePart() {
    this.syncEventDate();
  }

  get deadlineMax(): string {
    if (!this.formData?.event_date) return '';
    const d = new Date(this.formData.event_date.slice(0, 10) + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }

  get rsvpError(): string | null {
    if (!this.formData?.rsvp_deadline || !this.formData?.event_date) return null;
    const rsvp_deadline = this.formData.rsvp_deadline.slice(0, 10);
    const deadline = new Date(rsvp_deadline + 'T00:00:00');
    const maxDate = new Date(this.deadlineMax + 'T00:00:00');
    if (deadline > maxDate) {
      return `La fecha límite debe ser al menos 1 semana antes del evento (máx. ${this.deadlineMax})`;
    }
    return null;
  }

  get valid(): boolean {
    return !this.rsvpError;
  }

  async uploadLogo(domEvent: any) {
    const input = domEvent.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.formData?.id) return;

    this.uploadingLogo = true;
    try {
      const url = await this.storage.upload(this.formData.id, file);
      this.formData.couple_logo_url = url;
    } catch (err: any) {
      alert('Error al subir el logo: ' + (err?.message || ''));
    } finally {
      this.uploadingLogo = false;
      input.value = '';
    }
  }

  async uploadAdressPhoto(domEvent: any) {
    const input = domEvent.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.formData?.id) return;

    this.uploadingAdress = true;
    try {
      const url = await this.storage.upload(this.formData.id, file);
      this.formData.adress_photo_url = url;
    } catch (err: any) {
      alert('Error al subir la foto del lugar: ' + (err?.message || ''));
    } finally {
      this.uploadingAdress = false;
      input.value = '';
    }
  }

  removeLogo() {
    this.formData.couple_logo_url = null;
  }

  removeAdressPhoto() {
    this.formData.adress_photo_url = null;
  }

  async saveSettings() {
    this.saving = true;
    this.save.emit(this.formData);

    const event = this.eventState.currentEvent();
    if (event) {
      await this.eventService.update(event.id, {
        title: this.formData.title,
        event_date: this.formData.event_date,
        adress: this.formData.adress,
        adress_url: this.formData.adress_url,
        location: this.formData.location,
        description: this.formData.description,
        rsvp_deadline: this.formData.rsvp_deadline,
        couple_logo_url: this.formData.couple_logo_url,
        adress_photo_url: this.formData.adress_photo_url,
        gif_table_url: this.formData.gif_table_url,
        music_url: this.formData.music_url,
      });
    }

    alert('Configuración guardada');
    this.saving = false;
  }
}
