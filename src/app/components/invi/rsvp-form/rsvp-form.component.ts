import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, signal, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event as AppEvent, RsvpResponse } from 'src/app/core/models';
import { RsvpResponseService } from 'src/app/services/rsvp-response.service';
import { InvitationService } from 'src/app/services/invitation.service';

@Component({
  standalone: false,
  selector: 'app-invi-rsvp-form',
  templateUrl: './rsvp-form.component.html',
  styleUrls: ['./rsvp-form.component.scss'],
})
export class RsvpFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() rsvpEvent: AppEvent | null = null;
  @Input() inviId: string | null = null;
  @Output() rsvpConfirmed = new EventEmitter<void>();
  attending: 'yes' | 'no' | null = null;
  plusOneAllowed = false;
  hasPlus = signal(false);
  foods = signal<string[]>([]);
  submitted = false;
  submitting = false;
  invitationId = '';
  guestName = signal('');
  isRevoked = false;

  countdown = signal({ days: '00', hours: '00', mins: '00', secs: '00' });
  private cdTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    public i18n: I18nService,
    private rsvpResponseService: RsvpResponseService,
    private invitationService: InvitationService,
  ) {}

  async ngOnInit() {
    this.startCountdown();
    if (this.inviId) {
      const inv = await this.invitationService.loadByToken(this.inviId);
      if (inv.status === 'revoked') {
        this.isRevoked = true;
        return;
      }
      this.invitationId = inv.id;
      this.plusOneAllowed = inv.plus_one_allowed === 1;
      this.guestName.set(inv.guest_name);
      const existing = await this.rsvpResponseService.loadByToken(this.inviId);
      if (existing) {
        this.submitted = true;
        this.attending = existing.attending as 'yes' | 'no';
        this.rsvpConfirmed.emit();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rsvpEvent'] && this.rsvpEvent) {
      this.startCountdown();
    }
  }

  private startCountdown() {
    if (this.cdTimer) {
      clearInterval(this.cdTimer);
      this.cdTimer = null;
    }

    if (!this.rsvpEvent) return;
    const deadline = new Date(this.rsvpEvent.event_date).getTime();
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        this.countdown.set({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      this.countdown.set({
        days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        mins: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        secs: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    this.cdTimer = setInterval(tick, 1000);
  }

  setAttending(v: 'yes' | 'no') {
    this.attending = v;
  }

  togglePlus() {
    if (!this.plusOneAllowed) return;
    this.hasPlus.update(v => !v);
  }

  toggleFood(f: string) {
    this.foods.update(list => {
      const i = list.indexOf(f);
      return i >= 0 ? list.filter(x => x !== f) : [...list, f];
    });
  }

  isSelected(f: string): boolean {
    return this.foods().includes(f);
  }

  async submitForm(form: HTMLFormElement, event: Event) {
    event.preventDefault();
    if (this.submitting || !this.attending || !this.invitationId) return;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
    if (!name) return;
    this.submitting = true;
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value?.trim();

    const guestCount = this.hasPlus() ? 2 : 1;

    await this.rsvpResponseService.submit(this.inviId!, {
      attending: this.attending,
      guest_count: guestCount,
      dietary_notes: this.foods().join(', ') || null,
      message: notes || null,
    });

    this.submitted = true;
    this.submitting = false;
    this.rsvpConfirmed.emit();
    this.confetti();
  }

  private confetti() {
    const colors = ['#3A6B4A', '#B89B6A', '#B8D4BE', '#fff', '#264D35', '#d4e8d8'];
    for (let i = 0; i < 90; i++) {
      const el = document.createElement('div');
      el.className = 'cf';
      const size = Math.random() * 9 + 4;
      el.style.cssText = `
        width:${size}px;height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}vw;
        animation-duration:${(Math.random() * 2.5 + 2).toFixed(1)}s;
        animation-delay:${(Math.random() * 0.6).toFixed(2)}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  ngOnDestroy() {
    if (this.cdTimer) clearInterval(this.cdTimer);
  }

  get dateFormat(): string {
    let resTicket = '';
    if (!this.rsvpEvent?.rsvp_deadline) return resTicket;
    const date = new Date(this.rsvpEvent?.rsvp_deadline);
    const month = date.toLocaleString(this.i18n.current, { month: 'long' });
    if (this.i18n.current === 'en') {
      resTicket = `${this.i18n.t('rsvp_deadline')} ${month} ${date.getDate()}${this.i18n.t('ticker_date_helper')} ${date.getFullYear()}`;
    } else if (this.i18n.current === 'es') {
      resTicket = `${this.i18n.t('rsvp_deadline')} ${date.getDate()}${this.i18n.t('ticker_date_helper')} ${month} ${date.getFullYear()}`;
    }
    return resTicket;
  }
}
