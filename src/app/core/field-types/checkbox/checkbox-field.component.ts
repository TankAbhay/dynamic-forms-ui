import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  templateUrl: './checkbox-field.component.html',
  styleUrl: './checkbox-field.component.scss'
})
export class CheckboxFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly isChecked = signal<boolean>(true);

  toggle(): void {
    this.isChecked.update(v => !v);
  }
}
