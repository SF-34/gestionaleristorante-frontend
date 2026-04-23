import { Injectable } from '@angular/core';
import { AuthSession } from '../models/auth.models';

const SESSION_STORAGE_KEY = 'gestionale.session';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  getSession(): AuthSession | null {
    const rawValue = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
