export interface FieldTypeCodeMaster {
  id: number;
  code: string;
  name: string;
  defaultIcon: string;
  defaultCategory: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  hasOptions: boolean;
  description?: string;
  sortOrder: number;
}
