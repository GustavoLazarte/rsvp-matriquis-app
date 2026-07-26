import { Component, HostListener, Input, OnChanges, OnDestroy, AfterViewInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-floating',
  templateUrl: './floating.component.html',
  styleUrls: ['./floating.component.scss'],
})
export class FloatingComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() rsvpEvent: Event | null = null;
  @Input() rsvpSubmitted = false;
  hidden = true;
  playing = false;
  blocked = signal(false);
  spotifyEmbedUrl: SafeResourceUrl | null = null;
  private audio: HTMLAudioElement | null = null;
  private sanitizer = inject(DomSanitizer);
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private rsvpDone = false;

  constructor(public i18n: I18nService, private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.buildEmbedUrl();
    if (!this.isSpotify && this.musicUrl) {
      this.tryAutoplay();
    }
  }

  ngAfterViewInit() {
    this.pollTimer = setInterval(() => {
      if (this.rsvpDone) return;
      const el = document.getElementById('rsvp');
      if (el && el.querySelector('.rsvp-ok')) {
        this.rsvpDone = true;
        this.cdr.detectChanges();
        if (this.pollTimer) clearInterval(this.pollTimer);
      }
    }, 500);
  }

  ngOnDestroy() {
    if (this.audio) this.audio.pause();
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  get hideRsvpButton(): boolean {
    return this.rsvpSubmitted || this.rsvpDone || this.isRsvpSectionVisible();
  }

  private isRsvpSectionVisible(): boolean {
    if (typeof document === 'undefined') return false;
    const el = document.getElementById('rsvp');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.hidden = window.scrollY < window.innerHeight * 0.9;
  }

  enableMusic() {
    if (this.playing || !this.musicUrl) return;
    if (this.isSpotify) {
      this.playing = true;
      return;
    }
    const audio = new Audio(this.musicUrl);
    audio.loop = true;
    audio.play().then(() => {
      this.audio = audio;
      this.playing = true;
      this.blocked.set(false);
    }).catch(() => {
      this.blocked.set(true);
      setTimeout(() => this.blocked.set(false), 3000);
    });
  }

  pause() {
    if (!this.playing || this.isSpotify) return;
    this.playing = false;
    if (this.audio) {
      this.audio.pause();
    }
  }

  scrollToRsvp() {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }

  get isSpotify(): boolean {
    return !!this.rsvpEvent?.music_url?.includes('spotify.com');
  }

  get musicUrl(): string {
    return this.rsvpEvent?.music_url || '';
  }

  private tryAutoplay() {
    if (!this.musicUrl) return;
    const audio = new Audio(this.musicUrl);
    audio.loop = true;
    audio.play().then(() => {
      this.audio = audio;
      this.playing = true;
    }).catch(() => {
      this.blocked.set(true);
      setTimeout(() => this.blocked.set(false), 3000);
    });
  }

  private buildEmbedUrl() {
    const url = this.rsvpEvent?.music_url || '';
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    this.spotifyEmbedUrl = match
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/track/${match[1]}`)
      : null;
  }
}
