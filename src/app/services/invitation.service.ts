import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { InvitationStateService } from '../core/services/invitation-state.service';
import type { Invitation } from '../core/models';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  readonly state = this.invitationState;

  constructor(
    private supabase: SupabaseService,
    private invitationState: InvitationStateService,
  ) {}

  async loadByEvent(eventId: string): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('invitations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data) this.invitationState.setInvitations(data as Invitation[]);
  }

  async loadByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase.supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();
    if (error) throw error;
    return data as Invitation | null;
  }

  async create(input: Partial<Invitation>): Promise<Invitation | null> {
    const { data, error } = await this.supabase.supabase
      .from('invitations')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    if (data) this.invitationState.addInvitation(data as Invitation);
    return data as Invitation | null;
  }

  async update(id: string, input: Partial<Invitation>): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('invitations')
      .update(input)
      .eq('id', id);
    if (error) throw error;
    this.invitationState.updateInvitation(id, input);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('invitations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.invitationState.removeInvitation(id);
  }
}
