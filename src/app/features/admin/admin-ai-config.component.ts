import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AiConfiguration,
  AiProviderInfo,
  UpdateAiConfigRequest,
  TestAiConnectionRequest,
  TestAiConnectionResult
} from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-ai-config',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-ai-config.component.html',
  styleUrl: './admin-ai-config.component.scss'
})
export class AdminAiConfigComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  readonly config = signal<AiConfiguration | null>(null);
  readonly providers = signal<AiProviderInfo[]>([]);

  readonly selectedProvider = signal<string>('');
  readonly selectedModel = signal<string>('');
  readonly customModelName = signal<string>('');
  readonly isCustomModel = signal<boolean>(false);

  readonly apiKeyInput = signal<string>('');
  readonly showApiKey = signal<boolean>(false);
  readonly baseUrl = signal<string>('');
  readonly temperature = signal<number>(0.2);
  readonly timeoutSeconds = signal<number>(30);

  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isTesting = signal<boolean>(false);

  readonly testResult = signal<TestAiConnectionResult | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadConfig();
    this.adminService.loadUnreadLogsCount();
  }

  loadConfig(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAiConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const cfg = res.data;
          this.config.set(cfg);
          this.providers.set(cfg.availableProviders || []);

          this.selectedProvider.set(cfg.provider || (cfg.availableProviders?.[0]?.id ?? ''));
          this.baseUrl.set(cfg.baseUrl || '');
          this.temperature.set(cfg.temperature ?? 0.2);
          this.timeoutSeconds.set(cfg.timeoutSeconds ?? 30);
          this.apiKeyInput.set('');

          if (cfg.model) {
            const currentProv = (cfg.availableProviders || []).find(p => p.id.toLowerCase() === (this.selectedProvider() || '').toLowerCase());
            const isStandard = currentProv?.recommendedModels?.includes(cfg.model);
            if (isStandard) {
              this.selectedModel.set(cfg.model);
              this.isCustomModel.set(false);
            } else {
              this.selectedModel.set('custom');
              this.customModelName.set(cfg.model);
              this.isCustomModel.set(true);
            }
          } else if (cfg.availableProviders?.[0]?.recommendedModels?.length) {
            this.selectedModel.set(cfg.availableProviders[0].recommendedModels[0]);
            this.isCustomModel.set(false);
          }

          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to load AI configuration.');
        }
      });
  }

  onProviderSelect(providerId: string): void {
    this.selectedProvider.set(providerId);
    this.testResult.set(null);
    this.successMessage.set(null);

    const prov = this.providers().find(p => p.id === providerId);
    if (prov) {
      this.baseUrl.set(prov.defaultBaseUrl);
      if (prov.recommendedModels && prov.recommendedModels.length > 0) {
        this.selectedModel.set(prov.recommendedModels[0]);
        this.isCustomModel.set(false);
      } else {
        this.selectedModel.set('custom');
        this.isCustomModel.set(true);
      }
    }
  }

  onModelChange(modelVal: string): void {
    if (modelVal === 'custom') {
      this.isCustomModel.set(true);
    } else {
      this.isCustomModel.set(false);
      this.selectedModel.set(modelVal);
    }
  }

  getActiveModel(): string {
    return this.isCustomModel() ? this.customModelName().trim() : this.selectedModel();
  }

  togglePasswordVisibility(): void {
    this.showApiKey.update(v => !v);
  }

  onTestConnection(): void {
    this.isTesting.set(true);
    this.testResult.set(null);
    this.errorMessage.set(null);

    const req: TestAiConnectionRequest = {
      provider: this.selectedProvider(),
      model: this.getActiveModel(),
      apiKey: this.apiKeyInput().trim() || null,
      baseUrl: this.baseUrl().trim() || null
    };

    this.adminService.testAiConnection(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isTesting.set(false);
          this.testResult.set(res.data);
        },
        error: (err) => {
          this.isTesting.set(false);
          this.testResult.set({
            success: false,
            latencyMs: 0,
            message: err?.error?.message || 'Connection test failed with server error.',
            provider: this.selectedProvider(),
            model: this.getActiveModel()
          });
        }
      });
  }

  onSave(): void {
    const activeModel = this.getActiveModel();
    if (!activeModel) {
      this.errorMessage.set('Model name cannot be empty.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UpdateAiConfigRequest = {
      provider: this.selectedProvider(),
      model: activeModel,
      apiKey: this.apiKeyInput().trim() || null,
      baseUrl: this.baseUrl().trim() || null,
      temperature: this.temperature(),
      timeoutSeconds: this.timeoutSeconds()
    };

    this.adminService.updateAiConfig(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.config.set(res.data);
          this.apiKeyInput.set('');
          this.successMessage.set('AI Model and API Key configuration saved successfully in database!');
          setTimeout(() => this.successMessage.set(null), 6000);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to save AI configuration.');
        }
      });
  }
}
