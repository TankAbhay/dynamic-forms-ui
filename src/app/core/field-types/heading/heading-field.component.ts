import { Component, input } from '@angular/core';

@Component({
  selector: 'app-heading-field',
  standalone: true,
  templateUrl: './heading-field.component.html',
  styleUrl: './heading-field.component.scss'
})
export class HeadingFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
