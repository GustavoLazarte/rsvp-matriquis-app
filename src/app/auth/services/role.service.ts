import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { MembershipRole } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private supabase: SupabaseService) {}

  async getMyRoleForOrg(orgId: string): Promise<MembershipRole | null> {
    const user = (await this.supabase.supabase.auth.getUser()).data.user;
    if (!user) return null;
    const { data } = await this.supabase.supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();
    return (data?.role as MembershipRole) || null;
  }

  async isPlatformAdmin(): Promise<boolean> {
    const user = (await this.supabase.supabase.auth.getUser()).data.user;
    if (!user) return false;
    const { data } = await this.supabase.supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'platform_admin');
    return !!(data && data.length > 0);
  }

  canManageEvent(role: MembershipRole | null): boolean {
    return role === 'platform_admin' || role === 'org_admin' || role === 'event_admin';
  }
}
