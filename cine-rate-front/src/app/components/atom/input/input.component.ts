import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, IonInput, IonButton, IonIcon],
  template: `
    <div class="input-group">
      <div class="label-row" *ngIf="showLabel">
        <label class="input-label">{{ label }}</label>
        <a *ngIf="showForgot" class="forgot-link" (click)="onForgot.emit()">¿Olvidaste?</a>
      </div>
      <div class="input-wrapper" [class.error]="invalid">
        <ion-icon [name]="iconName" class="input-icon"></ion-icon>
        <ion-input
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          (ionInput)="onInput($event)"
          (ionBlur)="onTouched()"
          class="custom-input"
        ></ion-input>
        <ion-button *ngIf="showToggle && type === 'password'" fill="clear" (click)="toggleType()" class="toggle-btn">
          <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
        </ion-button>
      </div>
    </div>
  `,
  styleUrls: ['./input.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() iconName = 'mail-outline';
  @Input() showToggle = false;
  @Input() showLabel = true;
  @Input() showForgot = false;
  @Input() invalid = false;
  @Output() onForgot = new EventEmitter<void>();
  
  value: any = '';
  showPassword = false;
  onChange: any = () => {};
  onTouched: any = () => {};
  
  writeValue(value: any): void { this.value = value; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  onInput(event: any) { this.value = event.target.value; this.onChange(this.value); }
  toggleType() { this.showPassword = !this.showPassword; this.type = this.showPassword ? 'text' : 'password'; }
}