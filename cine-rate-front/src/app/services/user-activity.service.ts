import { Injectable } from '@angular/core';
import { MOCK_MOVIES, Movie } from '../data/mock-data';

export interface WatchedMovieRecord {
  id: number;
  title: string;
  rating: number;
  genre: string;
  releaseDate: string;
  poster?: string;
  synopsis?: string;
  watchedAt: string;
}

export interface UserActivityStats {
  media: number;
  vistas: number;
}

@Injectable({
  providedIn: 'root',
})
export default class UserActivityService {
  private readonly storageKey = 'cine-rate-watched-movies';

  getWatchedMovies(): Movie[] {
    return this.loadRecords().map((record) => this.toMovie(record));
  }

  getStats(): UserActivityStats {
    const records = this.loadRecords();
    if (records.length === 0) {
      return { media: 0, vistas: 0 };
    }

    const totalRating = records.reduce((sum, record) => sum + record.rating, 0);
    return {
      media: Number((totalRating / records.length).toFixed(1)),
      vistas: records.length,
    };
  }

  recordWatchedMovie(movie: Movie, rating: number) {
    if (!movie || !Number.isFinite(Number(rating))) {
      return;
    }

    const normalizedRating = Math.max(1, Math.min(5, Number(rating)));
    const records = this.loadRecords();
    const nextRecord: WatchedMovieRecord = {
      id: Number(movie.id),
      title: movie.title,
      rating: normalizedRating,
      genre: movie.genre || 'Sin género',
      releaseDate: movie.releaseDate || '',
      poster: movie.poster || '',
      synopsis: movie.synopsis || '',
      watchedAt: new Date().toISOString(),
    };

    const index = records.findIndex((record) => record.id === nextRecord.id);
    if (index >= 0) {
      records[index] = nextRecord;
    } else {
      records.unshift(nextRecord);
    }

    this.saveRecords(records);
  }

  private loadRecords(): WatchedMovieRecord[] {
    const fallback = this.seedFromMockMovies();

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        this.saveRecords(fallback);
        return fallback;
      }

      const parsed = JSON.parse(raw) as WatchedMovieRecord[];
      if (!Array.isArray(parsed)) {
        this.saveRecords(fallback);
        return fallback;
      }

      const sanitized = parsed
        .map((record) => this.sanitizeRecord(record))
        .filter((record): record is WatchedMovieRecord => record !== null);

      if (sanitized.length === 0) {
        this.saveRecords(fallback);
        return fallback;
      }

      return sanitized;
    } catch {
      return fallback;
    }
  }

  private saveRecords(records: WatchedMovieRecord[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch {
      // Se ignora si el navegador bloquea localStorage.
    }
  }

  private seedFromMockMovies(): WatchedMovieRecord[] {
    return MOCK_MOVIES
      .filter((movie) => typeof movie.userRating === 'number')
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: Number(movie.userRating ?? movie.rating ?? 0),
        genre: movie.genre || 'Sin género',
        releaseDate: movie.releaseDate || '',
        poster: movie.poster || '',
        synopsis: movie.synopsis || '',
        watchedAt: new Date().toISOString(),
      }));
  }

  private sanitizeRecord(record: Partial<WatchedMovieRecord>): WatchedMovieRecord | null {
    const id = Number(record.id);
    const rating = Number(record.rating);

    if (!Number.isFinite(id) || !Number.isFinite(rating)) {
      return null;
    }

    return {
      id,
      title: String(record.title || 'Sin título'),
      rating: Math.max(1, Math.min(5, rating)),
      genre: String(record.genre || 'Sin género'),
      releaseDate: String(record.releaseDate || ''),
      poster: String(record.poster || ''),
      synopsis: String(record.synopsis || ''),
      watchedAt: String(record.watchedAt || new Date().toISOString()),
    };
  }

  private toMovie(record: WatchedMovieRecord): Movie {
    return {
      id: record.id,
      title: record.title,
      rating: record.rating,
      genre: record.genre,
      releaseDate: record.releaseDate,
      poster: record.poster,
      synopsis: record.synopsis,
      userRating: record.rating,
      reviews: [],
    };
  }
}