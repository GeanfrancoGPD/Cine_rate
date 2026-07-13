import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonInput, FormsModule],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss']
})
export class ProfileEditPage implements OnInit {
  user = {
    name: '',
    email: '',
    password: '',
  };

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  async ngOnInit() {
    try {
      const response: any = await lastValueFrom(
        this.http.get(`${environment.apiUrl}/auth-check`, { withCredentials: true })
      );

      if (response?.success && response?.user) {
        this.user = {
          name: response.user.nombre || response.user.email || '',
          email: response.user.email || '',
          password: '',
        };
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  async save() {
    try {
      const payload: Record<string, string> = {};
      if (this.user['name']) payload['nombre'] = this.user['name'];
      if (this.user['email']) payload['gmail'] = this.user['email'];
      if (this.user['password']) payload['password'] = this.user['password'];

      if (Object.keys(payload).length > 0) {
        await lastValueFrom(
          this.http.put(`${environment.apiUrl}/user`, payload, { withCredentials: true })
        );
      }
    } catch (error) {
      // Se ignora y se vuelve al perfil aunque no se haya actualizado
    }
    this.router.navigate(['/profile'], { queryParams: { refresh: Date.now() } });
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}
