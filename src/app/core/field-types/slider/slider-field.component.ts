import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-slider-field',
  standalone: true,
  templateUrl: './slider-field.component.html',
  styleUrl: './slider-field.component.scss'
})
export class SliderFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly sliderValue = signal<number>(65);

  onSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value) || 0;
    this.sliderValue.set(val);
  }
}
