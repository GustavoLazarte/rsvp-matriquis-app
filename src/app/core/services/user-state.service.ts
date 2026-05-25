import { Injectable, signal, computed } from '@angular/core';
import type { User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly email = computed(() => this._user()?.email ?? null);

  readonly displayName = computed(() =>
    this._user()?.email?.split('@')[0] ?? 'admin'
  );

  private readonly _currentEventId = signal<string | null>(null);

  readonly currentEventId = this._currentEventId.asReadonly();

  setUser(user: User | null): void {
    this._user.set(user);
  }

  setCurrentEventId(eventId: string | null): void {
    this._currentEventId.set(eventId);
  }

  reset(): void {
    this._user.set(null);
  }
}
