import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { SupabaseStorageService } from '../core/services/supabase-storage.service';
import { EventImageStateService } from '../core/services/event-image-state.service';
import type { EventImage, EventImageType } from '../core/models';

@Injectable({ providedIn: 'root' })
export class EventImageService {
  readonly state = this.imageState;

  constructor(
    private supabase: SupabaseService,
    private storage: SupabaseStorageService,
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

  async uploadAndCreate(
    eventId: string,
    file: File,
    type: EventImageType = 'gallery',
    sortOrder?: number,
  ): Promise<EventImage | null> {
    const url = await this.storage.upload(eventId, file);

    const maxOrder = await this.getMaxSortOrder(eventId);
    const sort_order = sortOrder ?? maxOrder + 1;

    return this.create({ event_id: eventId, url, type, sort_order });
  }

  async uploadBatch(
    eventId: string,
    files: File[],
    type: EventImageType = 'gallery',
  ): Promise<void> {
    const maxOrder = await this.getMaxSortOrder(eventId);

    const results = await Promise.all(
      files.map(async (file, i) => {
        const url = await this.storage.upload(eventId, file);
        return { event_id: eventId, url, type, sort_order: maxOrder + 1 + i };
      }),
    );

    await this.createBatch(results);
  }

  async remove(id: string): Promise<void> {
    const image = this.imageState.images().find((img) => img.id === id);
    if (!image) throw new Error('Image not found');

    const path = this.storage.extractPathFromUrl(image.url);
    if (path) {
      await this.storage.remove(path);
    }

    const { error } = await this.supabase.supabase
      .from('event_images')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.imageState.removeImage(id);
  }

  private async create(input: Partial<EventImage>): Promise<EventImage | null> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.imageState.addImage(data as EventImage);
    return data as EventImage | null;
  }

  private async createBatch(inputs: Partial<EventImage>[]): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .insert(inputs)
      .select();
    if (error) throw error;
    if (data) this.imageState.addImages(data as EventImage[]);
  }

  private async getMaxSortOrder(eventId: string): Promise<number> {
    const { data, error } = await this.supabase.supabase
      .from('event_images')
      .select('sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (error) throw error;
    return (data?.[0]?.sort_order ?? -1);
  }
}
