import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { MovieCardComponent } from '../../molecules/movie-card/movie-card.component';
import { GenreChipComponent } from '../../atom/genre-chip/genre-chip.component';
import { MOCK_MOVIES, Movie } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';

import services from '../../../services/pelis-api';

import { addIcons } from 'ionicons';
import {
  filmOutline,
  personOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    FormsModule,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    TopBarComponent,
    BottomNavComponent,
    MovieCardComponent,
    GenreChipComponent,
    IonSpinner,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private pelisApi = inject(services);
  popularMovies: Movie[] = [];
  genres: string[] = [];
  activeGenre = '';
  searchTerm = '';
  minRating = 0;
  sortBy: 'rating' | 'date' = 'rating';
  displayedMovies: Movie[] = [];
  isSearching = false;
  movieNotFound = false;

  constructor(public router: Router) {
    addIcons({
      filmOutline,
      personOutline,
      chevronForwardOutline,
    });
  }

  async ngOnInit() {
    const [movies, genresFromApi] = await Promise.all([
      this.pelisApi.getPopularMovies(),
      this.pelisApi.getGenres().catch(() => [] as string[]),
    ]);

    this.popularMovies = movies;
    this.genres =
      genresFromApi.length > 0
        ? genresFromApi
        : this.extractGenresFromMovies(this.popularMovies);
    this.applyFilters();
  }

  private extractGenresFromMovies(movies: Movie[]): string[] {
    const set = new Set<string>();
    movies.forEach((movie) => {
      this.parseGenres(movie.genre).forEach((genre) => set.add(genre));
    });
    return Array.from(set)
      .filter((genre) => genre && genre !== 'sin género')
      .slice(0, 12);
  }

  private parseGenres(value: string | null | undefined): string[] {
    return String(value || '')
      .split(/[\/,|]+/)
      .map((genre) => this.normalizeGenre(genre))
      .filter(Boolean);
  }

  private normalizeGenre(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private matchesGenre(movie: Movie, selectedGenre: string): boolean {
    const normalizedSelectedGenre = this.normalizeGenre(selectedGenre);
    if (!normalizedSelectedGenre) {
      return true;
    }
    return this.parseGenres(movie.genre).includes(normalizedSelectedGenre);
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

  goToMovieDetail(movie: Movie) {
    this.router.navigate(['/movie', movie.id], { state: { movie } });
  }

  selectGenre(genre: string) {
    this.activeGenre = this.activeGenre === genre ? '' : genre;
    this.applyFilters();
  }

  onSearch(term: string | null | undefined) {
    this.searchTerm = term ? String(term) : '';

    if (!this.searchTerm.trim()) {
      this.movieNotFound = false;
      this.displayedMovies = [...this.popularMovies];
      this.applyFilters();
    }
  }

  async searchMovie() {
    const term = this.searchTerm.trim();

    if (!term) {
      this.movieNotFound = false;
      this.applyFilters();
      return;
    }

    this.movieNotFound = false;

    // Buscar primero en memoria
    const localResults = this.popularMovies.filter((movie) =>
      movie.title.toLowerCase().includes(term.toLowerCase()),
    );

    if (localResults.length > 0) {
      this.displayedMovies = localResults;
      return;
    }

    // No estaba -> consultar backend
    this.isSearching = true;

    try {
      const movies = await this.pelisApi.searchMovie(term);

      if (movies.length > 0) {
        this.displayedMovies = movies;
      } else {
        this.displayedMovies = [];
        this.movieNotFound = true;
      }
    } catch (e) {
      this.displayedMovies = [];
      this.movieNotFound = true;
    } finally {
      this.isSearching = false;
    }
  }

  setMinRating(v: number) {
    this.minRating = v;
    this.applyFilters();
  }

  setSort(by: 'rating' | 'date') {
    this.sortBy = by;
    this.applyFilters();
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
    let list = this.popularMovies.slice();
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
      // parse date loosely by numbers inside string (best-effort)
      list.sort((a, b) => {
        const pa = String(a.releaseDate || '').match(/(\d{4})/);
        const pb = String(b.releaseDate || '').match(/(\d{4})/);
        const da = pa ? Number(pa[1]) : 0;
        const db = pb ? Number(pb[1]) : 0;
        return db - da;
      });
    }
    this.displayedMovies = list;
  }
}
