import { Component } from '@angular/core';
import { IonContent, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  onModeChange(newMode: 'login' | 'register') {
    this.mode = newMode;
  }

  async handleSubmit(credentials: any) {
    if (this.mode === 'login') {
      const toast = await this.toastCtrl.create({
        message: '✅ ¡Bienvenido a CineRate!',
        duration: 1500,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();

      setTimeout(() => {
        this.router.navigateByUrl('/home');
      }, 1600);
    } else {
      const toast = await this.toastCtrl.create({
        message: `🎉 ¡Cuenta creada exitosamente!`,
        duration: 1500,
        color: 'primary',
        position: 'bottom',
      });
      await toast.present();
      
      setTimeout(() => {
        this.mode = 'login';
      }, 1500);
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