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
    const title =
      data.titulo || data.title || data.original_title || 'Sin título';
    const rating = Number(
      data.puntuacion_tmdb ?? data.rating ?? data.vote_average ?? 0,
    );
    const genre = this.normalizeGenre(
      data.genero ||
        data.genre ||
        data.generos ||
        data.genre_names ||
        data.genres ||
        'Sin género',
    );
    const releaseDate = this.formatYear(
      data.fecha_lanzamiento || data.releaseDate || data.release_date || '',
    );
    const poster = data.poster_url || data.poster || data.poster_path || '';
    const synopsis =
      data.sinopsis ||
      data.synopsis ||
      data.overview ||
      'Sin sinopsis disponible.';
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

  async searchMovie(nombre: string) {
    const response = await fetch(
      `${this.apiUrl}/search-movie?nombre=${encodeURIComponent(nombre)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to search movie');
    }

    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];

    return data.map((movie: any) => this.formatDate(movie));
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

  async getMovieById(id: number) {
    try {
      const response = await fetch(`${this.apiUrl}/movies/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie by ID');
      }
      const payload = await response.json();
      const data = payload?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return this.formatDate(data);
      }
      throw new Error('Invalid movie data format');
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      throw new Error('Failed to fetch movie by ID');
    }
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
        return data
          .map((item: any) => this.normalizeGenre(item))
          .filter((item) => item && item !== 'Sin género');
      }
    } catch {
      return [];
    }
    return [];
  }

  // Comentarios

  async getComments(movieId: number) {
    try {
      const response = await fetch(`${this.apiUrl}/comments/${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const payload = await response.json();
      const data = payload?.data;
      return data && Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  async updateComment(commentId: number, comment: string, rating: number) {
    try {
      const response = await fetch(`${this.apiUrl}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          comentario: comment,
          puntaje: rating,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  async deleteComment(commentId: number) {
    try {
      const response = await fetch(`${this.apiUrl}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  async setComment(
    movieId: number,
    comment: string,
    rating: number,
    tipo: string,
  ) {
    try {
      const response = await fetch(`${this.apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contenidoId: movieId,
          tipoUsuario: tipo,
          puntaje: rating,
          comentario: comment,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to set comment');
      }
    } catch (error) {
      console.error('Error setting comment:', error);
      throw new Error('Failed to set comment');
    }
  }

  async checkAuth() {
    try {
      const response = await fetch(`${environment.apiUrl}/auth-check`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('No esta autenticado ');
      }

      const payload = await response.json();
      const data = payload;
      console.log('checkAuth response data:', data);
      return data.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      throw new Error('Failed to check authentication');
    }
  }
}
