import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { RatingStarsComponent } from '../../atom/rating-stars/rating-stars.component';
import { Movie } from '../../../data/mock-data';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, IonIcon, RatingStarsComponent],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Output() clickCard = new EventEmitter<Movie>();
}