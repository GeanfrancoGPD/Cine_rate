import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../../atom/search-bar/search-bar.component';
import { Router } from '@angular/router';

// 1. Importar el registrador y los íconos del archivo HTML
import { addIcons } from 'ionicons';
import {
  filmOutline,
  personCircleOutline,
  searchOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, IonIcon, SearchBarComponent],
  templateUrl: 'top-bar.component.html',
  styleUrls: ['top-bar.component.scss'],
})
export class TopBarComponent {
  @Output() onSearch = new EventEmitter<string>();

  constructor(public router: Router) {
    // 2. Registrar los íconos para que Ionic los renderice localmente
    addIcons({ filmOutline, personCircleOutline, searchOutline });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
