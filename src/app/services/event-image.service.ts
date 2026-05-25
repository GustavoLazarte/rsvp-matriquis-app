import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { EventImageStateService } from '../core/services/event-image-state.service';
import type { EventImage } from '../core/models';

@Injectable({ providedIn: 'root' })
export class EventImageService {
  readonly state = this.imageState;

  constructor(
    private supabase: SupabaseService,
    private imageState: EventImageStateService,
  ) {}

  async loadByEvent(eventId: string): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (data) this.imageState.setImages(data as EventImage[]);
  }

  async create(input: Partial<EventImage>): Promise<EventImage | null> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.imageState.addImage(data as EventImage);
    return data as EventImage | null;
  }

  async createBatch(inputs: Partial<EventImage>[]): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .insert(inputs)
      .select();
    if (error) throw error;
    if (data) this.imageState.addImages(data as EventImage[]);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('event_images')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.imageState.removeImage(id);
  }
}
