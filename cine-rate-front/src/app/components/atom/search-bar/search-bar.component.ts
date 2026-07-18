import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, IonIcon, IonInput, FormsModule],
  templateUrl: 'search-bar.component.html',
  styleUrls: ['search-bar.component.scss'],
})
export class SearchBarComponent {
  searchTerm = '';

  @Output() onSearch = new EventEmitter<string>();
  @Output() onSearchSubmit = new EventEmitter<string>();
}
