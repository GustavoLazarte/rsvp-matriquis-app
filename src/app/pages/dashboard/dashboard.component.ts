import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '@supabase/supabase-js';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.user = await this.auth.getUser();
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
