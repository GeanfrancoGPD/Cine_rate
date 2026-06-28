import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genre-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genre-chip.component.html',
  styleUrls: ['./genre-chip.component.scss']
})
export class GenreChipComponent {
  @Input() label = '';
  @Input() active = false;
  @Output() onClick = new EventEmitter<void>();
}