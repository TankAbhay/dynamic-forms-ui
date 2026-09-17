import { Component, input } from '@angular/core';

@Component({
  selector: 'app-time-field',
  standalone: true,
  templateUrl: './time-field.component.html',
  styleUrl: './time-field.component.scss'
})
export class TimeFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
