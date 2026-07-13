import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.scss']
})
export class ProfileStatsComponent {
  @Input() media = 0;
  @Input() vistas = 0;
}