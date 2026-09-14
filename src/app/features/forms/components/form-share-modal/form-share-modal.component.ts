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
  template: `
    <div class="templates-modal-backdrop" (click)="close.emit()">
      <div class="templates-modal-sheet" style="max-width: 640px;" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-titles">
            <h3><i class="fas fa-share-nodes text-primary"></i> Share & Access Control</h3>
            <p>Configure how users access and submit this form, or invite collaborators.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="close.emit()" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="share-modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Public Share Link Box -->
          <div class="share-link-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
            <label style="font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fas fa-link text-primary"></i> Direct Form Link
            </label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="text" readonly [value]="publicShareUrl()" 
                style="flex: 1; padding: 0.6rem 0.8rem; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; color: #1e293b; font-family: monospace;" />
              <button type="button" class="btn btn-primary" (click)="copyShareLink()" style="display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; padding: 0.6rem 1rem;">
                <i [class]="copiedLink() ? 'fas fa-check' : 'fas fa-copy'"></i>
                <span>{{ copiedLink() ? 'Copied!' : 'Copy Link' }}</span>
              </button>
              <a [href]="publicShareUrl()" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary" style="padding: 0.6rem 0.85rem;" title="Open in new tab">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
            <small style="display: block; color: #64748b; margin-top: 0.5rem; font-size: 0.775rem;">
              Direct submission URL. Anyone can access this link according to the Access Type selected below.
            </small>
          </div>

          <!-- Access Type Selector -->
          <div class="access-type-group">
            <label style="font-weight: 600; font-size: 0.875rem; color: #334155; margin-bottom: 0.6rem; display: block;">
              Access Mode
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
              <label 
                style="display: flex; flex-direction: column; gap: 0.35rem; padding: 0.9rem; border: 2px solid; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                [style.border-color]="accessType() === 'Public' ? '#4f46e5' : '#e2e8f0'"
                [style.background]="accessType() === 'Public' ? '#eef2ff' : '#fff'">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #1e293b;">
                  <input type="radio" name="accessType" value="Public" [ngModel]="accessType()" (ngModelChange)="accessType.set($event)" />
                  <span>Public Form</span>
                </div>
                <small style="color: #64748b; font-size: 0.775rem; line-height: 1.3;">
                  Open to all. Anyone with the link can submit without login.
                </small>
              </label>

              <label 
                style="display: flex; flex-direction: column; gap: 0.35rem; padding: 0.9rem; border: 2px solid; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                [style.border-color]="accessType() === 'Restricted' ? '#4f46e5' : '#e2e8f0'"
                [style.background]="accessType() === 'Restricted' ? '#eef2ff' : '#fff'">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #1e293b;">
                  <input type="radio" name="accessType" value="Restricted" [ngModel]="accessType()" (ngModelChange)="accessType.set($event)" />
                  <span>Restricted</span>
                </div>
                <small style="color: #64748b; font-size: 0.775rem; line-height: 1.3;">
                  Only invited users with authorized emails can submit.
                </small>
              </label>

              <label 
                style="display: flex; flex-direction: column; gap: 0.35rem; padding: 0.9rem; border: 2px solid; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                [style.border-color]="accessType() === 'Private' ? '#4f46e5' : '#e2e8f0'"
                [style.background]="accessType() === 'Private' ? '#eef2ff' : '#fff'">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #1e293b;">
                  <input type="radio" name="accessType" value="Private" [ngModel]="accessType()" (ngModelChange)="accessType.set($event)" />
                  <span>Private</span>
                </div>
                <small style="color: #64748b; font-size: 0.775rem; line-height: 1.3;">
                  Only you and designated collaborators have access.
                </small>
              </label>
            </div>
          </div>

          <!-- Allowed Submitter Emails (when Restricted) -->
          @if (accessType() === 'Restricted') {
            <div class="allowed-emails-card" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem;">
              <label style="font-weight: 600; font-size: 0.875rem; color: #1e293b; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fas fa-envelope-circle-check text-success"></i> Allowed Submitter Email Addresses
              </label>
              <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.6rem;">
                Enter allowed emails separated by commas, semicolons, or newlines. Submitters will sign in or use Google Sign-In to verify their email address.
              </p>
              <textarea 
                rows="3" 
                class="form-control" 
                style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.6rem; font-size: 0.875rem;"
                placeholder="user1@example.com, colleague@gmail.com, partner@company.com"
                [ngModel]="allowedEmails()"
                (ngModelChange)="allowedEmails.set($event)"></textarea>
            </div>
          }

          <!-- Collaborator Emails -->
          <div class="collaborator-emails-card" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem;">
            <label style="font-weight: 600; font-size: 0.875rem; color: #1e293b; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fas fa-users-gear text-primary"></i> Collaborator Emails (Co-managers)
            </label>
            <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.6rem;">
              Invited collaborators can view form submissions, download CSV exports, and manage responses.
            </p>
            <textarea 
              rows="2" 
              class="form-control" 
              style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.6rem; font-size: 0.875rem;"
              placeholder="teamlead@example.com, coowner@gmail.com"
              [ngModel]="collaboratorEmails()"
              (ngModelChange)="collaboratorEmails.set($event)"></textarea>
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
            <button type="button" class="btn btn-secondary" (click)="close.emit()" style="padding: 0.5rem 1rem;">
              Close
            </button>
            <button type="button" class="btn btn-primary" (click)="onSave()" [disabled]="saving()" style="padding: 0.5rem 1.25rem; display: inline-flex; align-items: center; gap: 0.4rem;">
              @if (saving()) {
                <i class="fas fa-spinner fa-spin"></i> Saving...
              } @else {
                <i class="fas fa-check"></i> Save Sharing Settings
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .templates-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .templates-modal-sheet {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      animation: modalSlideUp 0.2s ease-out;
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .header-titles h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header-titles p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    .btn-close-modal {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .btn-close-modal:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
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
