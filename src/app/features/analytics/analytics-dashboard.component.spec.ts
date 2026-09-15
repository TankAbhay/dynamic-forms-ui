import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { FormSubmissionService } from '../../core/services/form-submission.service';
import { FormService } from '../../core/services/form.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: FormSubmissionService, useValue: {} },
        { provide: FormService, useValue: { loadForms: vi.fn() } }
      ]
    });

    component = runInInjectionContext(injector, () => new AnalyticsDashboardComponent());
  });

  it('should initialize with 14,250 total submissions and 94% completion rate', () => {
    expect(component.totalSubmissions()).toBe(14250);
    expect(component.completionRate()).toBe(94);
    expect(component.avgTime()).toBe('2m 15s');
  });

  it('should compute valid SVG spline sparkline path', () => {
    const path = component.sparklinePath();
    expect(path).toContain('M 20 110');
    expect(path).toContain('C');
  });

  it('should update metrics when switching timeframe', () => {
    component.setTimeframe('30d');
    expect(component.selectedTimeframe()).toBe('30d');
    expect(component.totalSubmissions()).toBe(48620);
  });
});
