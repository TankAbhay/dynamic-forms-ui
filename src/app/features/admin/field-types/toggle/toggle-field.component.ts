import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-toggle-field',
  standalone: true,
  templateUrl: './toggle-field.component.html',
  styleUrl: './toggle-field.component.scss'
})
export class ToggleFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly isToggled = signal<boolean>(true);

  toggle(): void {
    this.isToggled.update(v => !v);
  }
}
