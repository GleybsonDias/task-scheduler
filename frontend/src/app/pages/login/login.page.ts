import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonSpinner,
    IonIcon,
  ],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  public showPassword = false;
  public isLoading = false;

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      personOutline,
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onForgotPassword() {
    const toast = await this.toastCtrl.create({
      message: 'A recuperação de senha estará disponível em breve.',
      duration: 3000,
      color: 'medium',
      position: 'bottom',
    });
    await toast.present();
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Higienização dos dados de entrada
    const payload = {
      email: this.loginForm.value.email.trim().toLowerCase(),
      password: this.loginForm.value.password,
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/tabs/home']);
      },
      error: async (err) => {
        this.isLoading = false;
        const message =
          err.error?.message ||
          'Falha ao autenticar. Verifique suas credenciais.';
        const toast = await this.toastCtrl.create({
          message,
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }
}
