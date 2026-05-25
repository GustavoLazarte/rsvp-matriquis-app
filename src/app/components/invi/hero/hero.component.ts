import { Component, HostListener } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  constructor(public i18n: I18nService) {}

  get heroSubHtml(): string {
    return this.i18n.t('hero_sub').replace(/\n/g, '<br/>');
  }

  setLang(lang: 'es' | 'en') {
    this.i18n.setLang(lang);
  }

  scrollToStory() {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
  }
}
