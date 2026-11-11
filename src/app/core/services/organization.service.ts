import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Organization } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(private supabase: SupabaseService) {}

  async getMyOrganizations(): Promise<Organization[]> {
    const { data: memberships } = await this.supabase.supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', (await this.supabase.supabase.auth.getUser()).data.user?.id);

    if (!memberships || memberships.length === 0) return [];

    const orgIds = memberships.map((m: any) => m.organization_id);
    const { data } = await this.supabase.supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);
    return (data as Organization[]) || [];
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data } = await this.supabase.supabase.from('organizations').select('*').eq('id', id).single();
    return (data as Organization) || null;
  }
}
