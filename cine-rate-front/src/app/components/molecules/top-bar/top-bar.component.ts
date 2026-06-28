import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../../atom/search-bar/search-bar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, IonIcon, SearchBarComponent],
  templateUrl: 'top-bar.component.html',
  styleUrls: ['top-bar.component.scss']
})
export class TopBarComponent {
  @Output() onSearch = new EventEmitter<string>();

  // ✅ Hacer router público para usarlo en el HTML
  constructor(public router: Router) {}

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}