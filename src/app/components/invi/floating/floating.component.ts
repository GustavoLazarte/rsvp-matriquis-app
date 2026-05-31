import { Component, HostListener, Input, OnChanges, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-floating',
  templateUrl: './floating.component.html',
  styleUrls: ['./floating.component.scss'],
})
export class FloatingComponent implements OnChanges {
  @Input() rsvpEvent: Event | null = null;
  hidden = true;
  playing = false;
  spotifyEmbedUrl: SafeResourceUrl | null = null;
  private audio: HTMLAudioElement | null = null;
  private sanitizer = inject(DomSanitizer);

  constructor(public i18n: I18nService) {}

  ngOnChanges() {
    this.buildEmbedUrl();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.hidden = window.scrollY < window.innerHeight * 0.9;
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

  play() {
    if (this.playing || !this.musicUrl) return;
    this.playing = true;
    if (!this.isSpotify) {
      const audio = new Audio(this.musicUrl);
      audio.loop = true;
      audio.play().catch(() => {});
      this.audio = audio;
    }
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }

  scrollToRsvp() {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }
}
