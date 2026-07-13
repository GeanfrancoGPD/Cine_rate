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
    }).format(date); // Resultado: 05/2026
  }

  formatDate(data: any) {
    const id = data.id;
    const title = data.titulo;
    const rating = data.puntuacion_tmdb || 0;
    const genre = data.genero;
    const releaseDate = this.formatYear(data.fecha_lanzamiento || '');
    const poster = data.poster_url || '';
    const synopsis = data.sinopsis || '';
    const actors = data.actors || [];
    const images = data.images || [];
    const userRating = data.puntuacion_tmdb || 0;
    const reviews = data.reviews || [];

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
    const data = await response.json();
    console.log('Pelis obtenidas desde la API:', data);
    const formattedData = data.data.map((movie: any) => this.formatDate(movie));
    console.log('Pelis formateadas:', formattedData);
    return formattedData;
  }
}
