import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserRole } from '../models/gym.models';
import { environment } from '../../environments/environment';
import { GYM_TOKEN_KEY } from './tokens';

export interface GymUser {
  role: UserRole;
  name: string;
}

const STORAGE_KEY = 'gym_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user$ = new BehaviorSubject<GymUser | null>(this.read());

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  userChanges() {
    return this.user$.asObservable();
  }

  currentUser(): GymUser | null {
    return this.user$.getValue();
  }

  isLoggedIn(): boolean {
    return !!this.user$.getValue() && !!localStorage.getItem(GYM_TOKEN_KEY);
  }

  login(role: UserRole, name: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string; user: GymUser }>(`${environment.apiUrl}/auth/login`, {
        role,
        name,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(GYM_TOKEN_KEY, res.token);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
          this.user$.next(res.user);
          this.router.navigate(['/app', 'dashboard']);
        }),
        map(() => undefined)
      );
  }

  logout(): void {
    localStorage.removeItem(GYM_TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  private read(): GymUser | null {
    if (!localStorage.getItem(GYM_TOKEN_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as GymUser;
    } catch {
      return null;
    }
  }
}

