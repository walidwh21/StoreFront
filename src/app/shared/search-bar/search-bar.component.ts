import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  query = '';
  @Output() search = new EventEmitter<string>();

  onSearchChange() {
    this.search.emit(this.query);
  }

  clear() {
    this.query = '';
    this.search.emit('');
  }
}
