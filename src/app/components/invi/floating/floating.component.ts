import { Component, HostListener, Input, OnChanges, OnDestroy, signal, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-floating',
  templateUrl: './floating.component.html',
  styleUrls: ['./floating.component.scss'],
})
export class FloatingComponent implements OnChanges, OnDestroy {
  @Input() rsvpEvent: Event | null = null;
  hidden = true;
  playing = false;
  blocked = signal(false);
  spotifyEmbedUrl: SafeResourceUrl | null = null;
  private audio: HTMLAudioElement | null = null;
  private sanitizer = inject(DomSanitizer);

  constructor(public i18n: I18nService) {}

  ngOnChanges() {
    this.buildEmbedUrl();
    if (!this.isSpotify && this.musicUrl) {
      this.tryAutoplay();
    }
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
    });
  }

  ngOnDestroy() {
    this.stop();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.hidden = window.scrollY < window.innerHeight * 0.9;
  }

  enableMusic() {
    if (this.isSpotify) {
      this.playing = !this.playing;
      return;
    }
    if (this.audio && !this.playing) {
      this.audio.play().then(() => {
        this.playing = true;
      });
      return;
    }
    if (this.playing || !this.musicUrl) return;
    const audio = new Audio(this.musicUrl);
    audio.loop = true;
    audio.play().then(() => {
      this.audio = audio;
      this.playing = true;
      this.blocked.set(false);
    }).catch(() => {
      this.blocked.set(true);
    });
  }

  stop() {
    if (!this.playing || this.isSpotify) return;
    this.playing = false;
    this.blocked.set(false);
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

  private buildEmbedUrl() {
    const url = this.rsvpEvent?.music_url || '';
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    this.spotifyEmbedUrl = match
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/track/${match[1]}`)
      : null;
  }
}
