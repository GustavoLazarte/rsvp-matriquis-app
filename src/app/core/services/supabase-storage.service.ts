import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private readonly bucket = 'event-images';

  constructor(private supabase: SupabaseService) {}

  async upload(
    eventId: string,
    file: File,
  ): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${eventId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.supabase.storage
      .from(this.bucket)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = this.supabase.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  async remove(path: string): Promise<void> {
    const { error } = await this.supabase.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw error;
  }

  extractPathFromUrl(url: string): string | null {
    const prefix = `/storage/v1/object/public/${this.bucket}/`;
    const idx = url.indexOf(prefix);
    if (idx === -1) return null;
    return url.substring(idx + prefix.length);
  }

  async list(eventId: string): Promise<string[]> {
    const { data, error } = await this.supabase.supabase.storage
      .from(this.bucket)
      .list(eventId);

    if (error) throw error;

    return data.map(
      (item) =>
        this.supabase.supabase.storage
          .from(this.bucket)
          .getPublicUrl(`${eventId}/${item.name}`).data.publicUrl,
    );
  }
}
