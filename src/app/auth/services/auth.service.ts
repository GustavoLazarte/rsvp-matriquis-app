import { Injectable } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async isAuthenticated(): Promise<boolean> {
    const session = await this.supabase.getSession();
    return !!session;
  }

  async getUser() {
    return this.supabase.getUser();
  }

  login(email: string, password: string) {
    return this.supabase.signIn(email, password);
  }

  logout() {
    return this.supabase.signOut();
  }
}
