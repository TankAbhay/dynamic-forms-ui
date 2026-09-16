import { Component, input } from '@angular/core';

@Component({
  selector: 'app-phone-field',
  standalone: true,
  templateUrl: './phone-field.component.html',
  styleUrl: './phone-field.component.scss'
})
export class PhoneFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
