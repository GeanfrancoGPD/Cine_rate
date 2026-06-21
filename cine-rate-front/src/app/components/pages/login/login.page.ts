import { Component } from '@angular/core';
import { IonContent, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
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

  constructor(private toastCtrl: ToastController) {}

  onModeChange(newMode: 'login' | 'register') {
    this.mode = newMode;
  }

  async handleSubmit(credentials: any) {
    if (this.mode === 'login') {
      // Siempre muestra éxito (demo)
      const toast = await this.toastCtrl.create({
        message: '✅ ¡Bienvenido a CineRate!',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
    } else {
      // Registro exitoso
      const toast = await this.toastCtrl.create({
        message: `🎉 ¡Cuenta creada exitosamente!`,
        duration: 2500,
        color: 'primary',
        position: 'bottom',
      });
      await toast.present();
      this.mode = 'login';
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
