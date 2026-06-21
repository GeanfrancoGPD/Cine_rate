import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'terms-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-footer">
      <p class="terms-text">
        Al continuar, aceptas nuestros 
        <strong (click)="termsClick.emit()">Términos y Condiciones</strong>.
      </p>
    </div>
  `,
  styleUrls: ['./terms-footer.component.scss']
})
export class TermsFooterComponent {
  @Output() termsClick = new EventEmitter<void>();
}