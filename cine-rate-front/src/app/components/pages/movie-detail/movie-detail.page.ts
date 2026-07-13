import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { RatingStarsComponent } from '../../atom/rating-stars/rating-stars.component';
import { ReviewCardComponent } from '../../molecules/review-card/review-card.component';
import { MOCK_MOVIES, Movie, MOCK_USER_PROFILE, Review } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';
import services from '../../../services/pelis-api';
import UserActivityService from '../../../services/user-activity.service';

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
    ReviewCardComponent
  ],
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss']
})
export class MovieDetailPage implements OnInit {
  private readonly pelisApi = inject(services);
  private readonly userActivity = inject(UserActivityService);
  movie?: Movie;
  selectedRating = 5;
  reviewText = '';
  currentUser = MOCK_USER_PROFILE.name;
  editingReviewId: number | null = null;
  editingText = '';
  editingRating = 5;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const fallbackMovie = MOCK_MOVIES.find((m) => m.id === id);

    try {
      const list = await this.pelisApi.getPopularMovies();
      const apiMovie = list.find((item: Movie) => Number(item.id) === id);

      if (apiMovie) {
        this.movie = apiMovie;
      } else if (fallbackMovie) {
        this.movie = fallbackMovie;
      }
    } catch (error) {
      if (fallbackMovie) {
        this.movie = fallbackMovie;
      }
    }
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
    return this.movie.reviews.reduce((sum, review) => sum + review.rating, 0) / this.movie.reviews.length;
  }

  get userAverageRating(): number | null {
    if (!this.movie?.reviews?.length) {
      return null;
    }
    const userReviews = this.movie.reviews.filter(r => r.reviewerType === 'user');
    return userReviews.length ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length : null;
  }

  get criticAverageRating(): number | null {
    if (!this.movie?.reviews?.length) {
      return null;
    }
    const criticReviews = this.movie.reviews.filter(r => r.reviewerType === 'critic');
    return criticReviews.length ? criticReviews.reduce((sum, review) => sum + review.rating, 0) / criticReviews.length : null;
  }

  get userReviewCount(): number {
    return this.movie?.reviews.filter(r => r.reviewerType === 'user').length || 0;
  }

  get criticReviewCount(): number {
    return this.movie?.reviews.filter(r => r.reviewerType === 'critic').length || 0;
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
      id: Date.now(),
      author: MOCK_USER_PROFILE.name || 'Usuario',
      avatar: '',
      rating: this.selectedRating,
      comment: text,
      date: new Date().toISOString().slice(0,10),
      reviewerType: 'user' as const
    };

    if (this.movie) {
      this.movie.reviews = this.movie.reviews || [];
      this.movie.reviews.unshift(newReview as any);
      this.userActivity.recordWatchedMovie(this.movie, this.selectedRating);
    }

    this.reviewText = '';
    this.selectedRating = 5;
    alert('Reseña enviada (demo)');
  }

  isReviewOwner(review: Review) {
    return review.author === this.currentUser;
  }

  startEditing(review: Review) {
    this.editingReviewId = review.id;
    this.editingText = review.comment;
    this.editingRating = review.rating;
  }

  cancelEditing() {
    this.editingReviewId = null;
  }

  saveEditedReview(review: Review) {
    const trimmed = this.editingText?.trim();
    if (!trimmed) {
      alert('Escribe tu reseña antes de guardar.');
      return;
    }
    review.comment = trimmed;
    review.rating = this.editingRating;
    review.date = new Date().toISOString().slice(0,10);
    this.editingReviewId = null;
  }

  deleteReview(reviewId: number) {
    if (!this.movie) {
      return;
    }
    this.movie.reviews = this.movie.reviews.filter(r => r.id !== reviewId);
    if (this.editingReviewId === reviewId) {
      this.cancelEditing();
    }
  }
}