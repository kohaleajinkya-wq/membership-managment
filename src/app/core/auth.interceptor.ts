import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GYM_TOKEN_KEY } from './tokens';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(GYM_TOKEN_KEY);
    let outgoing = req;
    if (token && !req.url.includes('/auth/login')) {
      outgoing = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(outgoing).pipe(
      catchError((err) => {
        if (err && err.status === 401) {
          localStorage.removeItem(GYM_TOKEN_KEY);
          localStorage.removeItem('gym_user');
          this.router.navigate(['/login']);
        }
        return throwError(err);
      })
    );
  }
}
