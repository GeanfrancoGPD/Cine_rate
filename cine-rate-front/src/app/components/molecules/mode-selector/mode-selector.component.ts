import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mode-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container">
      <div class="tabs-bg">
        <div class="tab-slider" [ngClass]="{'slider-left': mode === 'login', 'slider-right': mode === 'register'}"></div>
        <button class="tab-btn" [class.active]="mode === 'login'" (click)="modeChange.emit('login')">
          Entrar
        </button>
        <button class="tab-btn" [class.active]="mode === 'register'" (click)="modeChange.emit('register')">
          Registrarse
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./mode-selector.component.scss']
})
export class ModeSelectorComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() modeChange = new EventEmitter<'login' | 'register'>();
}