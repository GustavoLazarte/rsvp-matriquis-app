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

  setUser(user: User | null): void {
    this._user.set(user);
  }

  reset(): void {
    this._user.set(null);
  }
}
