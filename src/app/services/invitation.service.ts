import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { InvitationStateService } from '../core/services/invitation-state.service';
import { RsvpResponseService } from './rsvp-response.service';
import type { Invitation, Event, RsvpResponse } from '../core/models';

export interface InvitationLookup {
  invitation: Invitation;
  event: Event;
  response: RsvpResponse | null;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  readonly state = this.invitationState;

  constructor(
    private supabase: SupabaseService,
    private invitationState: InvitationStateService,
    private rsvpResponseService: RsvpResponseService,
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

  async loadByToken(token: string): Promise<Invitation> {
    const { data, error } = await this.supabase.supabase.rpc('get_invitation', { p_token: token });
    if (error) throw error;
    return (data as InvitationLookup).invitation;
  }

  async loadByTokenWithEvent(token: string): Promise<{ invitation: Invitation; event: Event }> {
    const { data, error } = await this.supabase.supabase.rpc('get_invitation', { p_token: token });
    if (error) throw error;
    const lookup = data as InvitationLookup;
    return { invitation: lookup.invitation, event: lookup.event };
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

  async trackOpen(token: string): Promise<void> {
    const { error } = await this.supabase.supabase.rpc('track_open', { p_token: token });
    if (error) throw error;
  }

  async revoke(id: string): Promise<void> {
    await this.update(id, { status: 'revoked' });
  }

  async restore(id: string): Promise<void> {
    const hasResponse = this.rsvpResponseService.state.responses().some(r => r.invitation_id === id);
    await this.update(id, { status: hasResponse ? 'responded' : 'pending' });
  }

  async remove(id: string): Promise<void> {
    await this.rsvpResponseService.removeByInvitationId(id);
    const { error } = await this.supabase.supabase
      .from('invitations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.invitationState.removeInvitation(id);
  }
}
