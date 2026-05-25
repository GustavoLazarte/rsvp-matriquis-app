import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { UserStateService } from '../core/services/user-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly state = this.userState;

  constructor(
    private supabase: SupabaseService,
    private userState: UserStateService,
  ) {
    this.supabase.onAuthStateChange((_event, session) => {
      this.userState.setUser(session?.user ?? null);
    });
  }

  async init(): Promise<void> {
    const user = await this.supabase.getUser();
    this.userState.setUser(user);
  }

  async login(email: string, password: string) {
    const result = await this.supabase.signIn(email, password);
    if (!result.error) {
      const user = await this.supabase.getUser();
      this.userState.setUser(user);
    }
    return result;
  }

  async logout(): Promise<void> {
    await this.supabase.signOut();
    this.userState.reset();
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.supabase.getSession();
    return !!session;
  }

}
