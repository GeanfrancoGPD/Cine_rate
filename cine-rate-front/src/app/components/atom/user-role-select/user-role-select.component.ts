import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-role-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-role-select.component.html',
  styleUrls: ['./user-role-select.component.scss'],
})
export class UserRoleSelectComponent {
  @Input() value = 'USUARIO';
  @Input() disabled = false;
  @Input() label = 'Rol';
  @Output() roleChange = new EventEmitter<string>();

  readonly roles = [
    { value: 'USUARIO', label: 'Usuario' },
    { value: 'CRITICO', label: 'Crítico' },
  ];

  onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.roleChange.emit(target.value);
  }
}
