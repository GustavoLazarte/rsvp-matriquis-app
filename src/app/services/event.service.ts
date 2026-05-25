import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { EventStateService } from '../core/services/event-state.service';
import type { Event } from '../core/models';

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly state = this.eventState;

  constructor(
    private supabase: SupabaseService,
    private eventState: EventStateService,
  ) {}

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) throw error;
    if (data) this.eventState.setEvents(data as Event[]);
  }

  async loadBySlug(slug: string): Promise<Event | null> {
    const { data, error } = await this.supabase.supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    if (data) {
      this.eventState.setEvents([data as Event]);
      this.eventState.selectEvent(data.id);
    }
    return data as Event | null;
  }

  async create(input: Partial<Event>): Promise<Event | null> {
    const { data, error } = await this.supabase.supabase
      .from('events')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.eventState.addEvent(data as Event);
    return data as Event | null;
  }

  async update(id: string, input: Partial<Event>): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('events')
      .update(input)
      .eq('id', id);
    if (error) throw error;
    this.eventState.updateEvent(id, input);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.eventState.removeEvent(id);
  }

  async getByUserId(userId: string): Promise<Event[]> {
    const { data, error } = await this.supabase.supabase
      .from('events')
      .select('*')
      .eq('admin_id', userId)
      .order('event_date', { ascending: true });
    if (error) throw error;
    return (data as Event[]) || [];
  }
}
