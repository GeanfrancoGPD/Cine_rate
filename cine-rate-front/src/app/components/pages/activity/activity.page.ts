import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSearchbar, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../molecules/top-bar/top-bar.component';
import { BottomNavComponent } from '../../molecules/bottom-nav/bottom-nav.component';
import { MovieCardComponent } from '../../molecules/movie-card/movie-card.component';
import { GenreChipComponent } from '../../atom/genre-chip/genre-chip.component';
import { MOCK_MOVIES, Movie } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    FormsModule,
    TopBarComponent,
    BottomNavComponent,
    MovieCardComponent,
    GenreChipComponent
  ],
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss']
})
export class ActivityPage implements OnInit {
  watchedMovies: Movie[] = [];
  genres: string[] = [];
  activeGenre = '';
  searchTerm = '';
  minRating = 0;
  sortBy: 'rating' | 'date' = 'rating';
  displayedMovies: Movie[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.watchedMovies = MOCK_MOVIES.filter(m => typeof m.userRating === 'number');
    const set = new Set<string>();
    this.watchedMovies.forEach(m => set.add(m.genre || ''));
    this.genres = Array.from(set).filter(g => g).slice(0, 12);
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
    this.router.navigate(['/movie', movie.id]);
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

  private applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    let list = this.watchedMovies.slice();
    if (this.activeGenre) {
      list = list.filter(m => (m.genre || '').toLowerCase() === this.activeGenre.toLowerCase());
    }
    if (term) {
      list = list.filter(m => (m.title || '').toLowerCase().includes(term));
    }
    if (this.minRating && this.minRating > 0) {
      list = list.filter(m => (m.rating || 0) >= this.minRating);
    }
    if (this.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
