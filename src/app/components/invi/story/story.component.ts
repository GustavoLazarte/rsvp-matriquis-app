import { Component, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
  @Input() rsvpEvent : Event | null = null;
  constructor(public i18n: I18nService) {}

  get storyTitleHtml(): string {
    return this.i18n.t('story_title').replace(/\n/g, '<br/>');
  }
}
