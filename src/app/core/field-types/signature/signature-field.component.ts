import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-signature-field',
  standalone: true,
  templateUrl: './signature-field.component.html',
  styleUrl: './signature-field.component.scss'
})
export class SignatureFieldComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly description = input<string>('');
  readonly required = input<boolean>(false);

  readonly isSigned = signal<boolean>(true);

  clearSignature(): void {
    this.isSigned.set(false);
  }

  signMock(): void {
    this.isSigned.set(true);
  }
}
