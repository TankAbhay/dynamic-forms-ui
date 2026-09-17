import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-radio-field',
  standalone: true,
  templateUrl: './radio-field.component.html',
  styleUrl: './radio-field.component.scss'
})
export class RadioFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly selectedOption = signal<string>('high');
}
