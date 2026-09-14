import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FormSharingConfig {
  accessType: 'Public' | 'Restricted' | 'Private';
  allowedEmails: string;
  collaboratorEmails: string;
}

@Component({
  selector: 'app-form-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-share-modal.component.html',
  styleUrl: './form-share-modal.component.scss'
})
export class FormShareModalComponent implements OnInit {
  readonly publicShareUrl = input.required<string>();
  readonly initialAccessType = input<'Public' | 'Restricted' | 'Private'>('Public');
  readonly initialAllowedEmails = input<string>('');
  readonly initialCollaboratorEmails = input<string>('');
  readonly saving = input<boolean>(false);

  readonly save = output<FormSharingConfig>();
  readonly close = output<void>();

  accessType = signal<'Public' | 'Restricted' | 'Private'>('Public');
  allowedEmails = signal<string>('');
  collaboratorEmails = signal<string>('');
  copiedLink = signal<boolean>(false);

  ngOnInit(): void {
    this.accessType.set(this.initialAccessType());
    this.allowedEmails.set(this.initialAllowedEmails());
    this.collaboratorEmails.set(this.initialCollaboratorEmails());
  }

  copyShareLink(): void {
    const url = this.publicShareUrl();
    if (!url) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedLink.set(true);
        setTimeout(() => this.copiedLink.set(false), 2500);
      }).catch(() => {
        // Fallback
      });
    }
  }

  onSave(): void {
    this.save.emit({
      accessType: this.accessType(),
      allowedEmails: this.allowedEmails().trim(),
      collaboratorEmails: this.collaboratorEmails().trim()
    });
  }
}
