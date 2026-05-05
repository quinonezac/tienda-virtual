import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatDividerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-center w-full">
            Iniciar Sesión
          </mat-card-title>
        </mat-card-header>

        <mat-card-content class="mt-6">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field class="w-full mb-4" appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>

            <mat-form-field class="w-full mb-4" appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>

            <button mat-flat-button color="primary" class="w-full mb-3"
              type="submit" [disabled]="loginForm.invalid || loading">
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>

          <mat-divider class="my-4"></mat-divider>

          <button mat-stroked-button class="w-full" (click)="onGoogleLogin()">
            Continuar con Google
          </button>

          @if (error) {
            <p class="text-red-500 text-sm mt-3 text-center">{{ error }}</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = false;
  error = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      const { email, password } = this.loginForm.value;
      await this.auth.loginWithEmail(email!, password!);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = 'Correo o contraseña incorrectos';
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (e) {
      this.error = 'Error al iniciar sesión con Google';
    }
  }
}