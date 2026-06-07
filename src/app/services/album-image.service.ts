import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { SupabaseStorageService } from '../core/services/supabase-storage.service';
import { AlbumImageStateService } from '../core/services/album-image-state.service';
import type { AlbumImage } from '../core/models';

@Injectable({ providedIn: 'root' })
export class AlbumImageService {
  readonly state = this.albumState;

  constructor(
    private supabase: SupabaseService,
    private storage: SupabaseStorageService,
    private albumState: AlbumImageStateService,
  ) {}

  async loadByEvent(eventId: string): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('album_images')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    this.albumState.setImages((data ?? []) as AlbumImage[]);
  }

  async uploadAndCreate(
    eventId: string,
    file: File,
    captionEs?: string,
    captionEn?: string,
    sortOrder?: number,
  ): Promise<AlbumImage | null> {
    const url = await this.storage.upload(eventId, file, 'album');

    const maxOrder = await this.getMaxSortOrder(eventId);
    const sort_order = sortOrder ?? maxOrder + 1;

    return this.create({
      event_id: eventId,
      url,
      caption_es: captionEs ?? null,
      caption_en: captionEn ?? null,
      sort_order,
    });
  }

  async updateCaption(id: string, captionEs: string | null, captionEn: string | null): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('album_images')
      .update({ caption_es: captionEs, caption_en: captionEn })
      .eq('id', id);
    if (error) throw error;
    this.albumState.updateImage(id, { caption_es: captionEs, caption_en: captionEn });
  }

  async updateSortOrder(id: string, sort_order: number): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('album_images')
      .update({ sort_order })
      .eq('id', id);
    if (error) throw error;
    this.albumState.updateImage(id, { sort_order });
  }

  async remove(id: string): Promise<void> {
    const image = this.albumState.images().find((img) => img.id === id);
    if (!image) throw new Error('Album image not found');

    const path = this.storage.extractPathFromUrl(image.url);
    if (path) {
      await this.storage.remove(path);
    }

    const { error } = await this.supabase.supabase
      .from('album_images')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.albumState.removeImage(id);
  }

  private async create(input: Partial<AlbumImage>): Promise<AlbumImage | null> {
    const { data, error } = await this.supabase.supabase
      .from('album_images')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.albumState.addImage(data as AlbumImage);
    return data as AlbumImage | null;
  }

  private async getMaxSortOrder(eventId: string): Promise<number> {
    const { data, error } = await this.supabase.supabase
      .from('album_images')
      .select('sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: false })
      .limit(1);
    if (error) throw error;
    return (data?.[0]?.sort_order ?? -1);
  }
}
