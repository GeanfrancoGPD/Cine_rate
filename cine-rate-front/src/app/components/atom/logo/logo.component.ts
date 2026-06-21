import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="logo-container">
      <div class="logo-wrapper">
        <ion-icon name="film-outline" class="logo-icon"></ion-icon>
        <h1 class="app-title">CineRate</h1>
      </div>
      <p class="tagline">Tu crítica importa. Únete a la comunidad cinéfila definitiva.</p>
    </div>
  `,
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent {}