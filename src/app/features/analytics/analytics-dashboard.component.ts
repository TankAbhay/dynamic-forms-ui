import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormSubmissionService } from '../../core/services/form-submission.service';
import { FormService } from '../../core/services/form.service';

export interface DailyDataPoint {
  day: string;
  count: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly formSubmissionService = inject(FormSubmissionService);
  private readonly formService = inject(FormService);

  readonly selectedTimeframe = signal<'7d' | '30d' | '90d'>('7d');
  readonly totalSubmissions = signal<number>(14250);
  readonly completionRate = signal<number>(94);
  readonly avgTime = signal<string>('2m 15s');
  readonly sentimentPositive = signal<number>(78);
  readonly sentimentNeutral = signal<number>(16);
  readonly sentimentNegative = signal<number>(6);

  // Sparkline data points matching showcase image (10d, 7k, 12k, 10d, 23d)
  readonly trendPoints = signal<DailyDataPoint[]>([
    { day: 'Mon', count: 4200, x: 20, y: 110 },
    { day: 'Tue', count: 7000, x: 80, y: 80 },
    { day: 'Wed', count: 12000, x: 140, y: 40 },
    { day: 'Thu', count: 9800, x: 200, y: 65 },
    { day: 'Fri', count: 14200, x: 260, y: 25 },
    { day: 'Sat', count: 11500, x: 320, y: 45 },
    { day: 'Sun', count: 14250, x: 380, y: 20 }
  ]);

  // SVG Path for smooth spline sparkline
  readonly sparklinePath = computed(() => {
    const pts = this.trendPoints();
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      d += ` C ${cx1} ${prev.y}, ${cx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  });

  // SVG Closed area path for gradient fill under sparkline
  readonly sparklineAreaPath = computed(() => {
    const base = this.sparklinePath();
    const pts = this.trendPoints();
    if (!base || pts.length === 0) return '';
    return `${base} L ${pts[pts.length - 1].x} 140 L ${pts[0].x} 140 Z`;
  });

  // Radial Gauge circumference calculation (radius = 54)
  readonly gaugeCircumference = 2 * Math.PI * 54;
  readonly gaugeDashOffset = computed(() => {
    const rate = this.completionRate();
    return this.gaugeCircumference * (1 - rate / 100);
  });

  ngOnInit(): void {
    this.formService.getForms().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  setTimeframe(tf: '7d' | '30d' | '90d'): void {
    this.selectedTimeframe.set(tf);
    if (tf === '30d') {
      this.totalSubmissions.set(48620);
      this.completionRate.set(92);
      this.avgTime.set('2m 30s');
    } else if (tf === '90d') {
      this.totalSubmissions.set(134800);
      this.completionRate.set(91);
      this.avgTime.set('2m 45s');
    } else {
      this.totalSubmissions.set(14250);
      this.completionRate.set(94);
      this.avgTime.set('2m 15s');
    }
  }
}
