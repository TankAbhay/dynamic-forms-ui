import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-rating-field',
  standalone: true,
  templateUrl: './rating-field.component.html',
  styleUrl: './rating-field.component.scss'
})
export class RatingFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly currentRating = signal<number>(4);

  setRating(stars: number): void {
    this.currentRating.set(stars);
  }
}
