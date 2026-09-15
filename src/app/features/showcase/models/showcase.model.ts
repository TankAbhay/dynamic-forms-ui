export type FeatureTab = 'ai' | 'studio' | 'security' | 'submissions' | 'architecture';

export interface ShowcaseStat {
  value: string;
  label: string;
}

export interface TechStackItem {
  name: string;
  role: string;
  icon: string;
  color: string;
}
