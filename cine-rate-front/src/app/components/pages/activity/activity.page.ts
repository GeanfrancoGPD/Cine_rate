import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { MovieCardComponent } from '../../molecules/movie-card/movie-card.component';
import { GenreChipComponent } from '../../atom/genre-chip/genre-chip.component';
import { Movie } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';
import UserActivityService from '../../../services/user-activity.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    FormsModule,
    TopBarComponent,
    BottomNavComponent,
    MovieCardComponent,
    GenreChipComponent,
  ],
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {
  watchedMovies: Movie[] = [];
  genres: string[] = [];
  activeGenre = '';
  searchTerm = '';
  minRating = 0;
  sortBy: 'rating' | 'date' = 'rating';
  displayedMovies: Movie[] = [];

  constructor(
    private router: Router,
    private readonly userActivity: UserActivityService,
  ) {}

  ngOnInit() {
    this.watchedMovies = this.userActivity.getWatchedMovies();
    this.genres = this.getGenresFromMovies(this.watchedMovies);
    this.applyFilters();
  }

  onSearch(term: string | null | undefined) {
    this.searchTerm = term ? String(term) : '';
    this.applyFilters();
  }

  onTabChange(tab: 'home' | 'activity' | 'profile') {
    if (tab === 'home') {
      this.router.navigate(['/home']);
    } else if (tab === 'profile') {
      this.router.navigate(['/profile']);
    }
  }

  goToMovieDetail(movie: Movie) {
    this.router.navigate(['/movie', movie.id], { state: { movie } });
  }

  selectGenre(genre: string) {
    this.activeGenre = this.activeGenre === genre ? '' : genre;
    this.applyFilters();
  }

  setMinRating(v: number) {
    this.minRating = v;
    this.applyFilters();
  }

  setSort(by: 'rating' | 'date') {
    this.sortBy = by;
    this.applyFilters();
  }

  private normalizeGenre(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private formatGenreLabel(value: string): string {
    const normalized = this.normalizeGenre(value);
    if (!normalized) {
      return '';
    }
    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private parseGenres(value: string | null | undefined): string[] {
    return String(value || '')
      .split(/[\/,|]+/)
      .map((genre) => this.normalizeGenre(genre))
      .filter(Boolean);
  }

  private getGenresFromMovies(movies: Movie[]): string[] {
    const set = new Set<string>();
    movies.forEach((movie) => {
      this.parseGenres(movie.genre).forEach((genre) => {
        const label = this.formatGenreLabel(genre);
        if (label && label !== 'Sin Genero') {
          set.add(label);
        }
      });
    });
    return Array.from(set).slice(0, 12);
  }

  private matchesGenre(movie: Movie, selectedGenre: string): boolean {
    const normalizedSelectedGenre = this.normalizeGenre(selectedGenre);
    if (!normalizedSelectedGenre) {
      return true;
    }
    return this.parseGenres(movie.genre).includes(normalizedSelectedGenre);
  }

  private getDisplayRating(value: number | string | null | undefined): number {
    const parsed = Number(value ?? 0);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return parsed > 5 ? parsed / 2 : parsed;
  }

  private applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    let list = this.watchedMovies.slice();
    if (this.activeGenre) {
      list = list.filter((m) => this.matchesGenre(m, this.activeGenre));
    }
    if (term) {
      list = list.filter((m) => (m.title || '').toLowerCase().includes(term));
    }
    if (this.minRating && this.minRating > 0) {
      list = list.filter(
        (m) => this.getDisplayRating(m.rating) >= this.minRating,
      );
    }
    if (this.sortBy === 'rating') {
      list.sort(
        (a, b) =>
          this.getDisplayRating(b.rating) - this.getDisplayRating(a.rating),
      );
    } else {
      const parseYear = (value?: string) => {
        const match = String(value || '').match(/(\d{4})/);
        return match ? Number(match[1]) : 0;
      };
      list.sort((a, b) => parseYear(b.releaseDate) - parseYear(a.releaseDate));
    }
    this.displayedMovies = list;
  }
}
