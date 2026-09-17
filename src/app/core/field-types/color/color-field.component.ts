import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-color-field',
  standalone: true,
  templateUrl: './color-field.component.html',
  styleUrl: './color-field.component.scss'
})
export class ColorFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly currentColor = signal<string>('#2563eb');

  onColorChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val) this.currentColor.set(val);
  }
}
