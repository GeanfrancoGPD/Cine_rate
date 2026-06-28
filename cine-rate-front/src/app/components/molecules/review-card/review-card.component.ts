import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonTextarea } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { RatingStarsComponent } from '../../atom/rating-stars/rating-stars.component';
import { Review } from '../../../data/mock-data';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, IonIcon, IonTextarea, IonButton, FormsModule, RatingStarsComponent],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent {
  @Input() review!: Review;
}