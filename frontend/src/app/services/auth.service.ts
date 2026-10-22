import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';
import { Preferences } from '@capacitor/preferences';

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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private currentToken: string | null = null;

  constructor() {
    this.loadInitialSession();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Acesso síncrono para o Interceptor (caso já esteja carregado)
  public getTokenSync(): string | null {
    return this.currentToken;
  }

  // Acesso assíncrono para os Guards garantirem a leitura do disco
  public async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    this.currentToken = value;
    return value;
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  private async loadInitialSession(): Promise<void> {
    const token = await Preferences.get({ key: this.TOKEN_KEY });
    const user = await Preferences.get({ key: this.USER_KEY });

    this.currentToken = token.value;
    if (user.value) {
      try {
        this.currentUserSubject.next(JSON.parse(user.value));
      } catch (e) {
        console.error('Erro ao fazer parse do usuário salvo', e);
      }
    }
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

  async logout(): Promise<void> {
    this.currentToken = null;
    this.currentUserSubject.next(null);
    await Preferences.remove({ key: this.TOKEN_KEY });
    await Preferences.remove({ key: this.USER_KEY });
  }

  getProfile(): Observable<{ message?: string; user: User }> {
    return this.http
      .get<{ message?: string; user: User }>(`${this.baseUrl}/me`)
      .pipe(
        tap((res) => {
          if (res && res.user) {
            const current = this.currentUserValue;
            const updated = { ...current, ...res.user };
            this.currentUserSubject.next(updated);
            Preferences.set({
              key: this.USER_KEY,
              value: JSON.stringify(updated),
            });
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
          this.currentUserSubject.next(merged);
          Preferences.set({
            key: this.USER_KEY,
            value: JSON.stringify(merged),
          });
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

  private async saveSession(token: string, user: User): Promise<void> {
    this.currentToken = token;
    this.currentUserSubject.next(user);
    await Preferences.set({ key: this.TOKEN_KEY, value: token });
    await Preferences.set({ key: this.USER_KEY, value: JSON.stringify(user) });
  }
}
