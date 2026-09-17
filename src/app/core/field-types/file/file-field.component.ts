import { Component, input } from '@angular/core';

@Component({
  selector: 'app-file-field',
  standalone: true,
  templateUrl: './file-field.component.html',
  styleUrl: './file-field.component.scss'
})
export class FileFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);
}
