import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
})
export class AuthFormComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() submitForm = new EventEmitter<any>();

  name = '';
  email = '';
  password = '';

  constructor() {
    addIcons({ arrowForwardOutline });
  }

  onSubmit() {
    if (this.mode === 'login') {
      this.submitForm.emit({ email: this.email, password: this.password });
    } else {
      this.submitForm.emit({
        name: this.name,
        email: this.email,
        password: this.password,
      });
    }
  }
}
