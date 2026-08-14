import { Injectable, inject, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  expiration: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private isBrowser = false;

  // Signal for reactive authentication state management in Angular 19
  private tokenSignal = signal<string | null>(null);

  public readonly isLoggedInSignal = computed(() => !!this.tokenSignal());
  public readonly currentUserSignal = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('jwt_username');
      if (storedToken) {
        this.tokenSignal.set(storedToken);
        this.currentUserSignal.set(storedUser);
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (this.isBrowser && response?.token) {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('jwt_username', response.username);
        }
        this.tokenSignal.set(response.token);
        this.currentUserSignal.set(response.username);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_username');
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSignal();
  }

  getToken(): string | null {
    if (this.tokenSignal()) {
      return this.tokenSignal();
    }
    if (this.isBrowser) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
}
