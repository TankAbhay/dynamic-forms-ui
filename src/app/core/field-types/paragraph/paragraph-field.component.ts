import { Component, input } from '@angular/core';

@Component({
  selector: 'app-paragraph-field',
  standalone: true,
  templateUrl: './paragraph-field.component.html',
  styleUrl: './paragraph-field.component.scss'
})
export class ParagraphFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
