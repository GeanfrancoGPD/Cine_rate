import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
// import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { RatingStarsComponent } from '../../atom/rating-stars/rating-stars.component';
import { ReviewCardComponent } from '../../molecules/review-card/review-card.component';
import { Movie, Review } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';
import services from '../../../services/pelis-api';
import UserActivityService from '../../../services/user-activity.service';

import { addIcons } from 'ionicons';
import { arrowBackOutline, personCircleOutline } from 'ionicons/icons';
@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton,
    FormsModule,
    BottomNavComponent,
    RatingStarsComponent,
    ReviewCardComponent,
  ],
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
})
export class MovieDetailPage implements OnInit {
  private readonly pelisApi = inject(services);
  private readonly userActivity = inject(UserActivityService);
  private readonly http = inject(HttpClient);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  movie?: Movie;
  selectedRating = 5;
  reviewText = '';
  user = {
    id: 0,
    nombre: '',
    email: '',
    tipo: '',
    comments: [],
  };
  editingReviewId: number | null = null;
  editingText = '';
  editingRating = 5;

  private normalizeReviewerType(value: unknown): 'user' | 'critic' {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === 'critic' || normalized === 'critico'
      ? 'critic'
      : 'user';
  }

  private normalizeReview(apiReview: any): Review {
    const rawRating = Number(
      apiReview?.puntaje ?? apiReview?.puntuacion ?? apiReview?.rating ?? 0,
    );
    const reviewerType = this.normalizeReviewerType(
      apiReview?.reviewerType ??
        apiReview?.tipo_usuario ??
        apiReview?.tipoUsuario ??
        apiReview?.tipo,
    );
    return {
      id: Number(apiReview?.id ?? 0),
      author: apiReview?.nombre ?? apiReview?.author ?? '',
      comment: apiReview?.comentario ?? apiReview?.comment ?? '',
      rating: Number.isFinite(rawRating) ? rawRating : 0,
      date: apiReview?.fecha_creacion ?? apiReview?.date ?? '',
      reviewerType,
    };
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    addIcons({ arrowBackOutline, personCircleOutline });
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state?.['movie']) {
      this.movie = navigation.extras.state['movie'] as Movie;
    }
  }

  private async loadCurrentUser() {
    const User = await this.pelisApi.checkAuth();
    console.log('tipo de usuario:', User);
    if (!User) {
      this.router.navigate(['/login']);
    }
    this.user = User;
    return User;
  }

  async ngOnInit() {
    await this.loadCurrentUser();

    try {
      if (!this.movie) {
        const apiMovie = await this.pelisApi.getMovieById(this.id);
        if (!apiMovie) {
          console.error('No se encontró la película con ID:', this.id);
          return;
        }
        this.movie = apiMovie;
      } else {
        console.log('Película cargada al instante desde el Home:', this.movie);
      }

      console.log('Cargando comentarios...');
      const reviews = await this.pelisApi.getComments(this.id);
      console.log('Comentarios cargados:', reviews);
      console.log('Comentarios sin normalizar:', reviews);
      this.movie.reviews = reviews.map((review) =>
        this.normalizeReview(review),
      );
      console.log('Comentarios normalizados:', this.movie.reviews);

      if (!reviews || reviews.length === 0) {
        console.log('La película no tiene comentarios aún.');
      }
    } catch (error) {
      console.error(
        'Error cargando los detalles o comentarios de la película:',
        error,
      );
    }

    this.reclassifyCurrentUserReviews();
  }

  onSearch(term: string) {
    console.log('Buscando:', term);
  }

  onTabChange(tab: 'home' | 'activity' | 'profile') {
    if (tab === 'home') {
      this.router.navigate(['/home']);
    } else if (tab === 'profile') {
      this.router.navigate(['/profile']);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  get globalRating(): number | null {
    if (!this.movie?.reviews?.length) {
      return this.movie?.rating ?? null;
    }
    return (
      this.movie.reviews.reduce((sum, review) => sum + review.rating, 0) /
      this.movie.reviews.length
    );
  }

  get userAverageRating(): number | null {
    const reviews = this.movie?.reviews ?? [];
    const userReviews = reviews.filter(
      (review) => review.reviewerType === 'user',
    );
    if (!userReviews.length) {
      return null;
    }
    const average =
      userReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      userReviews.length;
    return Number(average.toFixed(1));
  }

  get criticAverageRating(): number | null {
    const reviews = this.movie?.reviews ?? [];
    const criticReviews = reviews.filter(
      (review) => review.reviewerType === 'critic',
    );
    if (!criticReviews.length) {
      return null;
    }
    const average =
      criticReviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0,
      ) / criticReviews.length;
    return Number(average.toFixed(1));
  }

  get userReviewCount(): number {
    return (
      this.movie?.reviews.filter((r) => r.reviewerType === 'user').length || 0
    );
  }

  get criticReviewCount(): number {
    return (
      this.movie?.reviews.filter((r) => r.reviewerType === 'critic').length || 0
    );
  }

  submitReview() {
    const text = this.reviewText?.trim();
    if (!text) {
      alert('Escribe una reseña antes de enviar.');
      return;
    }
    if (text.length > 200) {
      alert('La reseña no puede exceder 200 caracteres.');
      return;
    }

    const newReview = {
      contenidoId: this.id,
      author: this.user.nombre,
      rating: this.selectedRating,
      comment: text,
      reviewerType: this.normalizeReviewerType(this.user.tipo),
    };

    if (this.movie) {
      this.movie.reviews = this.movie.reviews || [];
      this.movie.reviews.unshift(newReview as any);
      console.log('Nueva reseña agregada:', newReview);
      this.pelisApi.setComment(
        this.id,
        text,
        this.selectedRating,
        this.user.tipo,
      );
      this.userActivity.recordWatchedMovie(this.movie, this.selectedRating);
    }

    this.reviewText = '';
    this.selectedRating = 5;
    this.pelisApi.getComments(this.movie!.id).then((reviews) => {
      this.movie!.reviews = (reviews || []).map((review) =>
        this.normalizeReview(review),
      );
    });
  }

  private reclassifyCurrentUserReviews() {
    if (!this.movie?.reviews?.length) {
      return;
    }

    const reviewerType = this.normalizeReviewerType(this.user.tipo);
    this.movie.reviews = this.movie.reviews.map((review) => {
      if (review.author === this.user.nombre) {
        return { ...review, reviewerType };
      }
      return review;
    });
  }

  isReviewOwner(review: Review) {
    return review.author === this.user.nombre;
  }

  async startEditing(review: Review) {
    this.editingReviewId = review.id;
    this.editingText = review.comment;
    this.editingRating = review.rating;
  }

  cancelEditing() {
    this.editingReviewId = null;
  }

  async saveEditedReview(review: Review) {
    const trimmed = this.editingText?.trim();
    if (!trimmed) {
      alert('Escribe tu reseña antes de guardar.');
      return;
    }
    review.comment = trimmed;
    review.rating = this.editingRating;
    review.date = new Date().toISOString().slice(0, 10);
    this.editingReviewId = null;
    console.log('llamando a la funcion de update.....');
    await this.pelisApi.updateComment(review.id, review.comment, review.rating);
  }

  async deleteReview(reviewId: number) {
    if (!this.movie) {
      return;
    }
    this.movie.reviews = this.movie.reviews.filter((r) => r.id !== reviewId);
    if (this.editingReviewId === reviewId) {
      this.cancelEditing();
    }
    await this.pelisApi.deleteComment(reviewId);
  }
}
