import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonContent, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LogoComponent } from '../../atom/logo/logo.component';
import { ModeSelectorComponent } from '../../molecules/mode-selector/mode-selector.component';
import { AuthFormComponent } from '../../molecules/auth-form/auth-form.component';
import { TermsFooterComponent } from '../../molecules/terms-footer/terms-footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    LogoComponent,
    ModeSelectorComponent,
    AuthFormComponent,
    TermsFooterComponent,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  mode: 'login' | 'register' = 'login';

  constructor(
    private readonly toastCtrl: ToastController,
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  onModeChange(newMode: 'login' | 'register') {
    this.mode = newMode;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'primary' | 'medium' = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  async handleSubmit(credentials: any) {
    const payload = this.mode === 'login'
      ? {
          gmail: credentials?.gmail ?? credentials?.email,
          password: credentials?.password,
        }
      : {
          nombre: credentials?.nombre ?? credentials?.name,
          gmail: credentials?.gmail ?? credentials?.email,
          password: credentials?.password,
        };

    if (this.mode === 'login' && (!payload.gmail || !payload.password)) {
      await this.showToast('Completa tu correo y contraseña.', 'danger');
      return;
    }

    if (this.mode === 'register' && (!payload.nombre || !payload.gmail || !payload.password)) {
      await this.showToast('Completa tu nombre, correo y contraseña.', 'danger');
      return;
    }

    const endpoint = this.mode === 'login' ? '/login' : '/register';

    try {
      const response: any = await lastValueFrom(
        this.http.post(`${environment.apiUrl}${endpoint}`, payload, { withCredentials: true })
      );

      if (response?.success) {
        await this.showToast(
          response.message || (this.mode === 'login' ? '✅ ¡Bienvenido a CineRate!' : '🎉 ¡Cuenta creada exitosamente!'),
          'success',
        );

        if (this.mode === 'login') {
          setTimeout(() => this.router.navigateByUrl('/home'), 800);
        } else {
          setTimeout(() => {
            this.mode = 'login';
          }, 800);
        }
      } else {
        await this.showToast(response?.message || 'No se pudo completar la solicitud.', 'danger');
      }
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'No se pudo completar la solicitud.';
      await this.showToast(message, 'danger');
    }
  }

  async showTerms() {
    const toast = await this.toastCtrl.create({
      message: 'Términos y Condiciones - Versión Demo',
      duration: 2000,
      color: 'medium',
      position: 'bottom',
    });
    await toast.present();
  }
}