import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MOCK_USER_PROFILE } from '../../../data/mock-data';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonInput, FormsModule],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss']
})
export class ProfileEditPage {
  user = { ...MOCK_USER_PROFILE };

  constructor(private router: Router) {}

  save() {
    // Copiar cambios al mock (mutar el objeto exportado para que ProfilePage lo refleje)
    MOCK_USER_PROFILE.name = this.user.name;
    MOCK_USER_PROFILE.email = this.user.email;
    MOCK_USER_PROFILE.password = this.user.password;
    this.router.navigate(['/profile']);
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}
