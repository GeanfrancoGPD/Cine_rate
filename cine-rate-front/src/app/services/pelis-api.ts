import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export default class PelisApi {
  private apiUrl = environment.apiUrl;

  constructor() {}

  formatYear(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-VE', {
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private normalizeGenre(value: any): string {
    if (!value) return 'Sin género';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => (item ? String(item).trim() : ''))
        .filter(Boolean)
        .join(', ');
    }
    if (typeof value === 'object') {
      const values = Object.values(value as Record<string, unknown>)
        .map((item) => (item ? String(item).trim() : ''))
        .filter(Boolean);
      return values.join(', ');
    }
    return String(value);
  }

  formatDate(data: any) {
    const id = Number(data.id ?? data.tmdb_id ?? 0);
    const title = data.titulo || data.title || data.original_title || 'Sin título';
    const rating = Number(data.puntuacion_tmdb ?? data.rating ?? data.vote_average ?? 0);
    const genre = this.normalizeGenre(
      data.genero || data.genre || data.generos || data.genre_names || data.genres || 'Sin género',
    );
    const releaseDate = this.formatYear(data.fecha_lanzamiento || data.releaseDate || data.release_date || '');
    const poster = data.poster_url || data.poster || data.poster_path || '';
    const synopsis = data.sinopsis || data.synopsis || data.overview || 'Sin sinopsis disponible.';
    const actors = Array.isArray(data.actors) ? data.actors : [];
    const images = Array.isArray(data.images) ? data.images : [];
    const userRating = data.userRating ?? undefined;
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];

    return {
      id,
      title,
      rating,
      genre,
      releaseDate,
      poster,
      synopsis,
      actors,
      images,
      userRating,
      reviews,
    };
  }

  async getPopularMovies() {
    const response = await fetch(`${this.apiUrl}/popular-movies`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    const payload = await response.json();
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return list.map((movie: any) => this.formatDate(movie));
  }

  async getGenres() {
    try {
      const response = await fetch(`${this.apiUrl}/generos`);
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      const data = payload?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return Object.values(data)
          .map((item) => this.normalizeGenre(item))
          .filter((item) => item && item !== 'Sin género');
      }
      if (Array.isArray(data)) {
        return data.map((item: any) => this.normalizeGenre(item)).filter((item) => item && item !== 'Sin género');
      }
    } catch {
      return [];
    }
    return [];
  }
}
