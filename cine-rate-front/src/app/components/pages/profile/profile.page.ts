import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import UserActivityService from '../../../services/user-activity.service';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { ProfileStatsComponent } from '../../molecules/profile-stats/profile-stats.component';
import { ProfileCommentComponent } from '../../molecules/profile-comment/profile-comment.component';
import {
  UserProfile,
  UserComment,
} from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  logOutOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';

addIcons({ personCircleOutline, logOutOutline, createOutline, trashOutline });
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton,
    FormsModule,
    TopBarComponent,
    BottomNavComponent,
    ProfileStatsComponent,
    ProfileCommentComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    password: '',
    avatar: '',
    media: 0,
    vistas: 0,
    subdivisions: 0,
    comments: [],
  };

  editingCommentId: number | null = null;
  editingText = '';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly userActivity: UserActivityService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(() => {
      this.loadUser();
    });
  }

  async loadUser() {
    try {
      const response: any = await lastValueFrom(
        this.http.get(`${environment.apiUrl}/auth-check`, { withCredentials: true })
      );

      if (response?.success && response?.user) {
        const stats = this.userActivity.getStats();
        this.user = {
          name: response.user.nombre || response.user.email || 'Usuario',
          email: response.user.email || '',
          password: '',
          avatar: '',
          media: stats.media,
          vistas: stats.vistas,
          subdivisions: 0,
          comments: [],
        };
        this.syncStats();
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  private syncStats() {
    const stats = this.userActivity.getStats();
    this.user.media = stats.media;
    this.user.vistas = stats.vistas;
  }

  onSearch(term: string) {
    console.log('Buscando:', term);
  }

  onTabChange(tab: 'home' | 'activity' | 'profile') {
    if (tab === 'home') {
      this.router.navigate(['/home']);
    } else if (tab === 'activity') {
      this.router.navigate(['/activity']);
    } else if (tab === 'profile') {
      this.router.navigate(['/profile']);
    }
  }

  startEditingComment(comment: UserComment) {
    this.editingCommentId = comment.id;
    this.editingText = comment.content;
  }

  cancelEditingComment() {
    this.editingCommentId = null;
    this.editingText = '';
  }

  saveEditedComment(comment: UserComment) {
    const trimmed = this.editingText?.trim();
    if (!trimmed) {
      alert('Escribe un comentario antes de guardar.');
      return;
    }
    comment.content = trimmed;
    this.cancelEditingComment();
  }

  deleteComment(commentId: number) {
    this.user.comments = this.user.comments.filter((c) => c.id !== commentId);
    if (this.editingCommentId === commentId) {
      this.cancelEditingComment();
    }
  }

  editProfile() {
    this.router.navigate(['/profile/edit']);
  }

  async logout() {
    try {
      await lastValueFrom(
        this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
      );
    } catch (error) {
      // Ignorar error de cierre de sesión y seguir al login
    }
    this.router.navigate(['/login']);
  }

  async confirmDelete() {
    const ok = window.confirm(
      'Eliminar este perfil será permanente. ¿Deseas continuar?',
    );
    if (ok) {
      try {
        const response: any = await lastValueFrom(
          this.http.delete(`${environment.apiUrl}/user`, { withCredentials: true })
        );

        if (!response?.success) {
          throw new Error(response?.message || 'No se pudo eliminar la cuenta.');
        }
      } catch (error) {
        alert('No se pudo eliminar la cuenta.');
        return;
      }

      this.router.navigate(['/login']);
    }
  }
}
