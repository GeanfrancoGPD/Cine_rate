import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { ProfileStatsComponent } from '../../molecules/profile-stats/profile-stats.component';
import { ProfileCommentComponent } from '../../molecules/profile-comment/profile-comment.component';
import {
  MOCK_USER_PROFILE,
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
  user!: UserProfile;

  editingCommentId: number | null = null;
  editingText = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.user = MOCK_USER_PROFILE;
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

  logout() {
    // Navega a la pantalla de login al salir
    this.router.navigate(['/login']);
  }

  confirmDelete() {
    const ok = window.confirm(
      'Eliminar este perfil será permanente. ¿Deseas continuar?',
    );
    if (ok) {
      // Limpiar los datos del mock y volver al login
      MOCK_USER_PROFILE.name = '';
      MOCK_USER_PROFILE.email = '';
      MOCK_USER_PROFILE.password = '';
      MOCK_USER_PROFILE.avatar = '';
      MOCK_USER_PROFILE.media = 0;
      MOCK_USER_PROFILE.likes = 0;
      MOCK_USER_PROFILE.subdivisions = 0;
      MOCK_USER_PROFILE.comments = [];
      this.router.navigate(['/login']);
    }
  }
}
