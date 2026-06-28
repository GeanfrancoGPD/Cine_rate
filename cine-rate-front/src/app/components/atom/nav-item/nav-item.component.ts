import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: 'nav-item.component.html',
  styleUrls: ['nav-item.component.scss']
})
export class NavItemComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() active = false;
  @Output() onClick = new EventEmitter<void>();
}