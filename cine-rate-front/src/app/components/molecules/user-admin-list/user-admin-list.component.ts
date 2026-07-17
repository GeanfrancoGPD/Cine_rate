import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRoleSelectComponent } from '../../atom/user-role-select/user-role-select.component';

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
}

@Component({
  selector: 'app-user-admin-list',
  standalone: true,
  imports: [CommonModule, UserRoleSelectComponent],
  templateUrl: './user-admin-list.component.html',
  styleUrls: ['./user-admin-list.component.scss'],
})
export class UserAdminListComponent {
  @Input() users: AdminUser[] = [];
  @Input() loading = false;
  @Output() roleChange = new EventEmitter<{ id: number; tipo: string }>();

  trackByUserId(_: number, user: AdminUser) {
    return user.id;
  }

  normalizeRole(value = '') {
    const normalized = String(value || '').trim().toUpperCase();
    if (normalized === 'CRITICO') {
      return 'CRITICO';
    }
    if (normalized === 'ADMIN') {
      return 'ADMIN';
    }
    return 'USUARIO';
  }

  getRoleValue(user: AdminUser) {
    return user.tipo === 'CRITICO' ? 'CRITICO' : 'USUARIO';
  }

  handleRoleChange(user: AdminUser, value: string) {
    if (user.tipo === 'ADMIN') {
      return;
    }
    this.roleChange.emit({ id: user.id, tipo: value });
  }
}
