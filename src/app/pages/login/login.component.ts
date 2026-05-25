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
  loading = false;
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get emailError(): string {
    if (!this.email) return '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) ? '' : 'Email inválido';
  }

  get passwordError(): string {
    if (!this.password) return '';
    return this.password.length >= 6 ? '' : 'Mínimo 6 caracteres';
  }

  get valid(): boolean {
    return !!this.email && !!this.password && !this.emailError && !this.passwordError;
  }

  async onLogin() {
    if (this.loading || !this.valid) return;
    this.loading = true;
    this.error = '';
    const { error } = await this.auth.login(this.email, this.password);
    this.loading = false;
    if (error) {
      this.error =
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : error.message;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
