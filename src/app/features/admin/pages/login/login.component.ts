import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  siteName = environment.whiteLabel.siteName;
  cityName = environment.whiteLabel.city;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  isSubmitting = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gestion-portal-propiedades/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al iniciar sesión:', err);
        if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos. Por favor intenta nuevamente.';
        } else if (err.status === 429) {
          this.errorMessage = 'Demasiados intentos fallidos. Espera un minuto antes de reintentar.';
        } else {
          this.errorMessage = 'Ocurrió un error al conectar con el servidor. Verifica tu conexión.';
        }
      }
    });
  }
}
