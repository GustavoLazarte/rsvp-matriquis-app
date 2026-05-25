import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    this.error = '';
    const { error } = await this.auth.login(this.email, this.password);
    if (error) {
      this.error = error.message;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
