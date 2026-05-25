import { Component, OnDestroy, signal } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-rsvp-form',
  templateUrl: './rsvp-form.component.html',
  styleUrls: ['./rsvp-form.component.scss'],
})
export class RsvpFormComponent implements OnDestroy {
  attending: 'yes' | 'no' | null = null;
  hasPlus = signal(false);
  foods = signal<string[]>([]);
  submitted = false;
  submitting = false;

  countdown = signal({ days: '00', hours: '00', mins: '00', secs: '00' });
  private cdTimer: ReturnType<typeof setInterval> | null = null;

  constructor(public i18n: I18nService) {
    this.startCountdown();
  }

  private startCountdown() {
    const deadline = new Date('2026-08-21T23:59:59').getTime();
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

  submitForm(form: HTMLFormElement, event: Event) {
    event.preventDefault();
    if (this.submitting) return;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
    if (!name || !this.attending) return;
    this.submitting = true;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value?.trim();
    const payload = new URLSearchParams({
      name,
      email,
      attending: this.attending,
      has_plus: this.hasPlus() ? 'yes' : 'no',
      food: this.foods().join(', '),
      notes: notes || '',
      lang: this.i18n.current,
      timestamp: new Date().toISOString(),
    });
    new Image().src = `https://docs.google.com/forms/d/e/1FAIpQLSxxxxxxxxx/viewform?usp=pp_url&${payload}`;
    setTimeout(() => {
      this.submitted = true;
      this.submitting = false;
      this.confetti();
    }, 900);
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
}
