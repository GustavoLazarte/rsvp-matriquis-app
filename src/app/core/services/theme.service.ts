import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { EventTheme } from '../models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private supabase: SupabaseService) {}

  async getThemeByEventId(eventId: string): Promise<EventTheme | null> {
    const { data } = await this.supabase.supabase.from('event_themes').select('*').eq('event_id', eventId).maybeSingle();
    return (data as EventTheme) || null;
  }

  async upsertTheme(theme: Partial<EventTheme>): Promise<EventTheme | null> {
    const { data } = await this.supabase.supabase.from('event_themes').upsert(theme).select().single();
    return (data as EventTheme) || null;
  }

  applyTheme(theme: EventTheme | null): void {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primary_color) root.style.setProperty('--rsvp-primary', theme.primary_color);
    if (theme.secondary_color) root.style.setProperty('--rsvp-secondary', theme.secondary_color);
    if (theme.background_color) root.style.setProperty('--rsvp-bg', theme.background_color);
    if (theme.text_color) root.style.setProperty('--rsvp-text', theme.text_color);
    if (theme.accent_color) root.style.setProperty('--rsvp-accent', theme.accent_color);
  }
}
