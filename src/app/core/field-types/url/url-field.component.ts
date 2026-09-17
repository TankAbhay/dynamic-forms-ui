import { Component, input } from '@angular/core';

@Component({
  selector: 'app-url-field',
  standalone: true,
  templateUrl: './url-field.component.html',
  styleUrl: './url-field.component.scss'
})
export class UrlFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
