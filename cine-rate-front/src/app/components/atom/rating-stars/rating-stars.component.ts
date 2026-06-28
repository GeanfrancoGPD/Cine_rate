import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() max = 5;
  @Input() size = '16px';

  get stars(): number[] {
    return Array(this.max).fill(0).map((_, i) => i + 1);
  }

  get fullStars(): number {
    return Math.floor(this.rating);
  }

  get hasHalfStar(): boolean {
    return this.rating % 1 >= 0.5;
  }

  get emptyStars(): number {
    return this.max - Math.ceil(this.rating);
  }
}