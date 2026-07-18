import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  UserAdminListComponent,
  type AdminUser,
} from '../../molecules/user-admin-list/user-admin-list.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserAdminListComponent],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users: AdminUser[] = [];
  loading = false;

  constructor(private readonly http: HttpClient) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const response: any = await lastValueFrom(
        this.http.get(`${environment.apiUrl}/users`, { withCredentials: true }),
      );

      if (response?.success) {
        this.users = (response.data || []).map((user: any) => ({
          id: Number(user.id),
          nombre: user.nombre || user.email || 'Sin nombre',
          email: user.email || '',
          tipo: String(user.tipo || 'USUARIO').toUpperCase(),
        }));
      }
    } catch (error) {
      console.error('No se pudieron cargar los usuarios', error);
    } finally {
      this.loading = false;
    }
  }

  async onRoleChange(event: { id: number; tipo: string }) {
    try {
      const response: any = await lastValueFrom(
        this.http.put(
          `${environment.apiUrl}/users/${event.id}/role`,
          { tipo: event.tipo },
          { withCredentials: true },
        ),
      );

      if (!response?.success) {
        throw new Error(response?.message || 'No se pudo actualizar el rol.');
      }

      this.users = this.users.map((user) =>
        user.id === event.id ? { ...user, tipo: event.tipo } : user,
      );
    } catch (error) {
      console.error('No se pudo actualizar el rol', error);
      alert('No se pudo actualizar el rol del usuario.');
    }
  }
}
