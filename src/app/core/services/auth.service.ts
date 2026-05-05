import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup,
         GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  currentUser = toSignal(user(this.auth));

  async loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    return signOut(this.auth);
  }

  async getToken(): Promise<string | null> {
    return this.auth.currentUser?.getIdToken() ?? null;
  }
}