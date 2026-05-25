import { Injectable, signal, computed } from '@angular/core';
import type { Invitation } from '../models';

@Injectable({ providedIn: 'root' })
export class InvitationStateService {
  private readonly _invitations = signal<Invitation[]>([]);

  readonly invitations = this._invitations.asReadonly();

  readonly pendingCount = computed(() =>
    this._invitations().filter(i => i.status === 'pending').length
  );

  readonly respondedCount = computed(() =>
    this._invitations().filter(i => i.status === 'responded').length
  );

  setInvitations(invitations: Invitation[]): void {
    this._invitations.set(invitations);
  }

  addInvitation(invitation: Invitation): void {
    this._invitations.update(list => [...list, invitation]);
  }

  updateInvitation(id: string, partial: Partial<Invitation>): void {
    this._invitations.update(list =>
      list.map(inv => (inv.id === id ? { ...inv, ...partial } : inv))
    );
  }

  removeInvitation(id: string): void {
    this._invitations.update(list => list.filter(inv => inv.id !== id));
  }

  reset(): void {
    this._invitations.set([]);
  }
}
