import { DynamicFormField } from '../../../core/models/form.model';

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  badge: string;
  fields: DynamicFormField[];
}
