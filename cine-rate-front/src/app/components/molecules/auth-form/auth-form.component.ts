import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../atom/input/input.component';
import { ButtonComponent } from '../../atom/button/button.component';

@Component({
  selector: 'auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
})
export class AuthFormComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() submitForm = new EventEmitter<any>();

  name = '';
  email = '';
  password = '';

  onSubmit() {
    if (this.mode === 'login') {
      this.submitForm.emit({ gmail: this.email, password: this.password });
    } else {
      this.submitForm.emit({
        nombre: this.name,
        gmail: this.email,
        password: this.password,
      });
    }
  }
}