import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    <button class="glow-button" [class.outline]="fill === 'outline'" (click)="onClick.emit()" [disabled]="disabled">
      <ion-icon *ngIf="iconStart" [name]="iconStart" slot="start"></ion-icon>
      <span>{{ label }}</span>
      <ion-icon *ngIf="iconEnd" [name]="iconEnd" slot="end"></ion-icon>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label = '';
  @Input() fill: 'solid' | 'outline' | 'clear' = 'solid';
  @Input() disabled = false;
  @Input() iconStart = '';
  @Input() iconEnd = '';
  @Output() onClick = new EventEmitter<void>();
}