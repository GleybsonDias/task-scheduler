import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  register(data: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, data);
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.saveSession(response.token, response.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<{
    message?: string;
    user: User;
  }> {
    return this.http
      .get<{
        message?: string;
        user: User;
      }>(`${this.baseUrl}/me`)
      .pipe(
        tap((res) => {
          if (res && res.user) {
            const current = this.currentUserValue;
            const updated = { ...current, ...res.user };
            localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
            this.currentUserSubject.next(updated);
          }
        }),
      );
  }

  updateProfile(data: UpdateProfileDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, data).pipe(
      tap((updatedUser) => {
        const current = this.currentUserValue;
        if (current) {
          const merged: User = { ...current, ...updatedUser };
          localStorage.setItem(this.USER_KEY, JSON.stringify(merged));
          this.currentUserSubject.next(merged);
        }
      }),
    );
  }

  changePassword(data: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/change-password`,
      data,
    );
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
