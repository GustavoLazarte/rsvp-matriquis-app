import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Template } from '../models';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private supabase: SupabaseService) {}

  async getTemplates(): Promise<Template[]> {
    const { data } = await this.supabase.supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return (data as Template[]) || [];
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const { data } = await this.supabase.supabase.from('templates').select('*').eq('id', id).single();
    return (data as Template) || null;
  }
}
