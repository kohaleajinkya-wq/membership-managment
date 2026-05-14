import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/gym.models';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  role: UserRole = 'admin';
  displayName = '';
  password = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app', 'dashboard']);
    }
  }

  submit(): void {
    if (!this.password.trim()) {
      return;
    }
    this.auth.login(this.role, this.displayName, this.password).subscribe(
      () => undefined,
      () => window.alert('Login failed. Start the API: cd backend && npm install && npm start')
    );
  }
}
