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

import { AdminNavTabsComponent } from './components/admin-nav-tabs/admin-nav-tabs.component';

@Component({
  selector: 'app-admin-ai-config',
  imports: [CommonModule, FormsModule, RouterModule, AdminNavTabsComponent],
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

  readonly showAddModel = signal<boolean>(false);
  readonly newModelCode = signal<string>('');
  readonly newModelDisplayName = signal<string>('');
  readonly isAddingModel = signal<boolean>(false);
  readonly addModelError = signal<string | null>(null);

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

  toggleAddModel(): void {
    this.showAddModel.update(v => !v);
    this.addModelError.set(null);
    if (!this.showAddModel()) {
      this.newModelCode.set('');
      this.newModelDisplayName.set('');
    }
  }

  onSaveNewModel(): void {
    const code = this.newModelCode().trim();
    if (!code) {
      this.addModelError.set('Model identifier code is required (e.g. gemini-3.5-flash-lite, gpt-4o-mini).');
      return;
    }

    const providerId = this.selectedProvider();
    if (!providerId) {
      this.addModelError.set('Please select a provider first.');
      return;
    }

    this.isAddingModel.set(true);
    this.addModelError.set(null);

    const displayName = this.newModelDisplayName().trim() || code;

    this.adminService.addAiModel(providerId, {
      modelCode: code,
      displayName: displayName
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        this.isAddingModel.set(false);
        const added = res.data;

        // Update local providers state with newly added model
        const updated = this.providers().map(p => {
          if (p.id.toLowerCase() === providerId.toLowerCase()) {
            const models = p.models ? [...p.models, added] : [added];
            const recommendedModels = p.recommendedModels ? [...p.recommendedModels] : [];
            if (!recommendedModels.includes(added.modelCode)) {
              recommendedModels.push(added.modelCode);
            }
            return { ...p, models, recommendedModels };
          }
          return p;
        });

        this.providers.set(updated);
        this.selectedModel.set(added.modelCode);
        this.isCustomModel.set(false);
        this.showAddModel.set(false);
        this.newModelCode.set('');
        this.newModelDisplayName.set('');
        this.successMessage.set(`Model '${added.modelCode}' added to database under provider '${providerId}'!`);
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isAddingModel.set(false);
        this.addModelError.set(err?.error?.message || 'Failed to add model to database.');
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
          this.providers.set(res.data.availableProviders || []);
          this.selectedModel.set(res.data.model);
          this.isCustomModel.set(false);
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
