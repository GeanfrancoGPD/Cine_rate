import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonSearchbar,
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
import { MOCK_MOVIES, Movie } from '../../../data/mock-data';
import { FormsModule } from '@angular/forms';

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
    IonIcon,
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
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  popularMovies: Movie[] = [];
  genres: string[] = [];
  activeGenre = '';
  searchTerm = '';
  minRating = 0;
  sortBy: 'rating' | 'date' = 'rating';
  displayedMovies: Movie[] = [];

  constructor(public router: Router) {
    addIcons({
      filmOutline,
      personOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.popularMovies = MOCK_MOVIES;
    // extraer géneros únicos desde los mocks
    const set = new Set<string>();
    this.popularMovies.forEach((m) => set.add(m.genre || ''));
    this.genres = Array.from(set)
      .filter((g) => g)
      .slice(0, 12);
    this.applyFilters();
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
    this.router.navigate(['/movie', movie.id]);
  }

  selectGenre(genre: string) {
    this.activeGenre = this.activeGenre === genre ? '' : genre;
    this.applyFilters();
  }

  onSearch(term: string | null | undefined) {
    this.searchTerm = term ? String(term) : '';
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
    let list = this.popularMovies.slice();
    if (this.activeGenre) {
      list = list.filter(
        (m) => (m.genre || '').toLowerCase() === this.activeGenre.toLowerCase(),
      );
    }
    if (term) {
      list = list.filter((m) => (m.title || '').toLowerCase().includes(term));
    }
    if (this.minRating && this.minRating > 0) {
      list = list.filter((m) => (m.rating || 0) >= this.minRating);
    }
    if (this.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
