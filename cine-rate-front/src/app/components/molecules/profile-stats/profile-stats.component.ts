import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.scss']
})
export class ProfileStatsComponent {
  @Input() media = 0;
  @Input() likes = 0;
}