import { Type } from '@angular/core';
import { TextFieldComponent } from './text/text-field.component';
import { TextareaFieldComponent } from './textarea/textarea-field.component';
import { NumberFieldComponent } from './number/number-field.component';
import { EmailFieldComponent } from './email/email-field.component';
import { DateFieldComponent } from './date/date-field.component';
import { TimeFieldComponent } from './time/time-field.component';
import { UrlFieldComponent } from './url/url-field.component';
import { DropdownFieldComponent } from './dropdown/dropdown-field.component';
import { RadioFieldComponent } from './radio/radio-field.component';
import { CheckboxFieldComponent } from './checkbox/checkbox-field.component';
import { PhoneFieldComponent } from './phone/phone-field.component';
import { RatingFieldComponent } from './rating/rating-field.component';
import { SliderFieldComponent } from './slider/slider-field.component';
import { ToggleFieldComponent } from './toggle/toggle-field.component';
import { FileFieldComponent } from './file/file-field.component';
import { SignatureFieldComponent } from './signature/signature-field.component';
import { ColorFieldComponent } from './color/color-field.component';
import { HeadingFieldComponent } from './heading/heading-field.component';
import { ParagraphFieldComponent } from './paragraph/paragraph-field.component';

export interface FieldTypeMeta {
  code: string;
  name: string;
  category: 'Structure' | 'Input' | 'Selection' | 'Advanced';
  icon: string;
  isStructure: boolean;
  hasOptions: boolean;
  supportsPlaceholder: boolean;
  htmlInputType?: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  component: Type<unknown>;
}

export const FIELD_TYPE_REGISTRY: Record<string, FieldTypeMeta> = {
  text: {
    code: 'text',
    name: 'Single-line Text',
    category: 'Input',
    icon: 'fas fa-font',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'text',
    defaultLabel: 'Text Field',
    defaultPlaceholder: 'Type your answer here...',
    component: TextFieldComponent
  },
  textarea: {
    code: 'textarea',
    name: 'Multi-line Text',
    category: 'Input',
    icon: 'fas fa-align-left',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'textarea',
    defaultLabel: 'Description / Notes',
    defaultPlaceholder: 'Enter detailed response...',
    component: TextareaFieldComponent
  },
  number: {
    code: 'number',
    name: 'Number Input',
    category: 'Input',
    icon: 'fas fa-hashtag',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'number',
    defaultLabel: 'Quantity / Amount',
    defaultPlaceholder: '0',
    component: NumberFieldComponent
  },
  email: {
    code: 'email',
    name: 'Email Address',
    category: 'Input',
    icon: 'fas fa-envelope',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'email',
    defaultLabel: 'Email Address',
    defaultPlaceholder: 'name@company.com',
    component: EmailFieldComponent
  },
  date: {
    code: 'date',
    name: 'Date Picker',
    category: 'Input',
    icon: 'fas fa-calendar-alt',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'date',
    defaultLabel: 'Select Date',
    component: DateFieldComponent
  },
  time: {
    code: 'time',
    name: 'Time Picker',
    category: 'Input',
    icon: 'fas fa-clock',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'time',
    defaultLabel: 'Select Time',
    component: TimeFieldComponent
  },
  url: {
    code: 'url',
    name: 'Website URL',
    category: 'Input',
    icon: 'fas fa-globe',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'url',
    defaultLabel: 'Website Link',
    defaultPlaceholder: 'https://example.com',
    component: UrlFieldComponent
  },
  dropdown: {
    code: 'dropdown',
    name: 'Dropdown Select',
    category: 'Selection',
    icon: 'fas fa-caret-square-down',
    isStructure: false,
    hasOptions: true,
    supportsPlaceholder: true,
    htmlInputType: 'select',
    defaultLabel: 'Choose an Option',
    defaultPlaceholder: 'Select an option...',
    component: DropdownFieldComponent
  },
  select: {
    code: 'select',
    name: 'Dropdown Select',
    category: 'Selection',
    icon: 'fas fa-caret-square-down',
    isStructure: false,
    hasOptions: true,
    supportsPlaceholder: true,
    htmlInputType: 'select',
    defaultLabel: 'Choose an Option',
    defaultPlaceholder: 'Select an option...',
    component: DropdownFieldComponent
  },
  radio: {
    code: 'radio',
    name: 'Radio Choices',
    category: 'Selection',
    icon: 'fas fa-dot-circle',
    isStructure: false,
    hasOptions: true,
    supportsPlaceholder: false,
    htmlInputType: 'radio',
    defaultLabel: 'Select One Option',
    component: RadioFieldComponent
  },
  checkbox: {
    code: 'checkbox',
    name: 'Single Checkbox',
    category: 'Selection',
    icon: 'fas fa-check-square',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'checkbox',
    defaultLabel: 'I agree to the terms',
    component: CheckboxFieldComponent
  },
  phone: {
    code: 'phone',
    name: 'Phone Number',
    category: 'Input',
    icon: 'fas fa-phone',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'tel',
    defaultLabel: 'Phone Number',
    defaultPlaceholder: '+1 (555) 000-0000',
    component: PhoneFieldComponent
  },
  rating: {
    code: 'rating',
    name: 'Star Rating',
    category: 'Advanced',
    icon: 'fas fa-star',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'rating',
    defaultLabel: 'Rate your experience',
    component: RatingFieldComponent
  },
  slider: {
    code: 'slider',
    name: 'Range Slider',
    category: 'Advanced',
    icon: 'fas fa-sliders',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'range',
    defaultLabel: 'Select percentage',
    component: SliderFieldComponent
  },
  toggle: {
    code: 'toggle',
    name: 'Switch Toggle',
    category: 'Selection',
    icon: 'fas fa-toggle-on',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'toggle',
    defaultLabel: 'Enable Notifications',
    component: ToggleFieldComponent
  },
  file: {
    code: 'file',
    name: 'File Upload',
    category: 'Advanced',
    icon: 'fas fa-cloud-arrow-up',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: true,
    htmlInputType: 'file',
    defaultLabel: 'Attach Documents',
    defaultPlaceholder: 'Choose File or Drag & Drop (Max 10MB)',
    component: FileFieldComponent
  },
  signature: {
    code: 'signature',
    name: 'Digital Signature',
    category: 'Advanced',
    icon: 'fas fa-pen-nib',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'signature',
    defaultLabel: 'Authorized Signature',
    component: SignatureFieldComponent
  },
  color: {
    code: 'color',
    name: 'Color Picker',
    category: 'Advanced',
    icon: 'fas fa-palette',
    isStructure: false,
    hasOptions: false,
    supportsPlaceholder: false,
    htmlInputType: 'color',
    defaultLabel: 'Pick Theme Color',
    component: ColorFieldComponent
  },
  heading: {
    code: 'heading',
    name: 'Section Heading',
    category: 'Structure',
    icon: 'fas fa-heading',
    isStructure: true,
    hasOptions: false,
    supportsPlaceholder: false,
    defaultLabel: 'Section Title',
    component: HeadingFieldComponent
  },
  paragraph: {
    code: 'paragraph',
    name: 'Informative Guidance',
    category: 'Structure',
    icon: 'fas fa-paragraph',
    isStructure: true,
    hasOptions: false,
    supportsPlaceholder: false,
    defaultLabel: 'Important instructions or guidance note for applicants...',
    component: ParagraphFieldComponent
  }
};

export const FIELD_TYPE_COMPONENTS: Record<string, Type<unknown>> = Object.keys(FIELD_TYPE_REGISTRY).reduce(
  (acc, key) => {
    acc[key] = FIELD_TYPE_REGISTRY[key].component;
    return acc;
  },
  {} as Record<string, Type<unknown>>
);

export function getFieldTypeMeta(typeCode: string | undefined): FieldTypeMeta | undefined {
  if (!typeCode) return undefined;
  return FIELD_TYPE_REGISTRY[typeCode.trim().toLowerCase()];
}

export function getFieldTypeComponent(typeCode: string | undefined): Type<unknown> {
  const meta = getFieldTypeMeta(typeCode);
  return meta?.component || TextFieldComponent;
}

export function isStructureField(typeCode: string | undefined): boolean {
  if (!typeCode) return false;
  const meta = getFieldTypeMeta(typeCode);
  if (meta) return meta.isStructure;
  const lower = typeCode.trim().toLowerCase();
  return lower === 'structure' || lower === 'heading' || lower === 'paragraph';
}

export function supportsPlaceholder(typeCode: string | undefined): boolean {
  const meta = getFieldTypeMeta(typeCode);
  return meta ? meta.supportsPlaceholder : false;
}

export function hasOptions(typeCode: string | undefined): boolean {
  const meta = getFieldTypeMeta(typeCode);
  return meta ? meta.hasOptions : false;
}

export function getHtmlInputType(typeCode: string | undefined): string {
  const meta = getFieldTypeMeta(typeCode);
  return meta?.htmlInputType || 'text';
}

export function getInitialFieldValue(fieldType: string | undefined, defaultValue?: string | null): any {
  if (isStructureField(fieldType)) return undefined;
  const code = (fieldType || '').trim().toLowerCase();
  if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
    if (code === 'checkbox' || code === 'toggle') {
      return defaultValue === 'true';
    }
    return defaultValue;
  }
  if (code === 'checkbox' || code === 'toggle') {
    return false;
  }
  return '';
}

