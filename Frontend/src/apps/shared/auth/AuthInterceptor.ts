import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interception for login/register requests
    if (request.url.includes('/login') || request.url.includes('/register')) {
      return next.handle(request);
    }

    const token = this.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.updateTokenFromResponse(event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleUnauthorizedError();
        }
        return throwError(() => error);
      })
    );
  }

  private getToken(): string | null {
    const student = localStorage.getItem('Student');
    if (!student) return null;
    
    try {
      const parsed = JSON.parse(student);
      return parsed?.token || null;
    } catch {
      return null;
    }
  }

  private updateTokenFromResponse(response: HttpResponse<any>): void {
    const newToken = response.headers?.get('Authorization')?.replace('Bearer ', '');
    if (newToken) {
      const student = JSON.parse(localStorage.getItem('Student') || '{}');
      student.token = newToken;
      localStorage.setItem('Student', JSON.stringify(student));
    }
  }

  private handleUnauthorizedError(): void {
    this.toastr.error('Session expired. Please login again.');
    localStorage.removeItem('Student');
    this.router.navigate(['/login']);
  }
}