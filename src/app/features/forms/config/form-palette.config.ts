import { ComponentPaletteItem } from '../../../core/models/form.model';

export interface FormPaletteConfigItem extends ComponentPaletteItem {
  labelKey: string;
  descKey: string;
}

export const FORM_PALETTE_CONFIG: FormPaletteConfigItem[] = [
  {
    type: 'heading',
    label: 'Section Heading',
    labelKey: 'forms.palette.heading',
    icon: 'fas fa-heading',
    description: 'Title header or divider',
    descKey: 'forms.palette.headingDesc',
    defaultLabel: 'Section Title'
  },
  {
    type: 'paragraph',
    label: 'Description Text',
    labelKey: 'forms.palette.paragraph',
    icon: 'fas fa-paragraph',
    description: 'Static informational guidance',
    descKey: 'forms.palette.paragraphDesc',
    defaultLabel: 'Please provide the details below carefully.'
  },
  {
    type: 'text',
    label: 'Text Box',
    labelKey: 'forms.palette.text',
    icon: 'fas fa-font',
    description: 'Single-line text input',
    descKey: 'forms.palette.textDesc',
    defaultLabel: 'Short Answer Question',
    defaultPlaceholder: 'Enter your answer here...'
  },
  {
    type: 'textarea',
    label: 'Text Area',
    labelKey: 'forms.palette.textarea',
    icon: 'fas fa-align-left',
    description: 'Multi-line detailed response',
    descKey: 'forms.palette.textareaDesc',
    defaultLabel: 'Detailed Explanation',
    defaultPlaceholder: 'Type your response here...'
  },
  {
    type: 'number',
    label: 'Number Input',
    labelKey: 'forms.palette.number',
    icon: 'fas fa-hashtag',
    description: 'Numeric quantities or amounts',
    descKey: 'forms.palette.numberDesc',
    defaultLabel: 'Quantity or Amount',
    defaultPlaceholder: '0'
  },
  {
    type: 'select',
    label: 'Dropdown Select',
    labelKey: 'forms.palette.select',
    icon: 'fas fa-chevron-circle-down',
    description: 'Choose one option from a list',
    descKey: 'forms.palette.selectDesc',
    defaultLabel: 'Select an Option',
    hasOptions: true
  },
  {
    type: 'radio',
    label: 'Radio Choices',
    labelKey: 'forms.palette.radio',
    icon: 'fas fa-dot-circle',
    description: 'Single-choice radio buttons',
    descKey: 'forms.palette.radioDesc',
    defaultLabel: 'Pick One Choice',
    hasOptions: true
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    labelKey: 'forms.palette.checkbox',
    icon: 'fas fa-check-square',
    description: 'Yes/No acknowledgment or toggle',
    descKey: 'forms.palette.checkboxDesc',
    defaultLabel: 'I confirm and accept the specified requirements.'
  },
  {
    type: 'date',
    label: 'Date Picker',
    labelKey: 'forms.palette.date',
    icon: 'fas fa-calendar-alt',
    description: 'Select calendar date',
    descKey: 'forms.palette.dateDesc',
    defaultLabel: 'Target Date'
  },
  {
    type: 'email',
    label: 'Email Address',
    labelKey: 'forms.palette.email',
    icon: 'fas fa-envelope',
    description: 'Email formatted input',
    descKey: 'forms.palette.emailDesc',
    defaultLabel: 'Work Email Address',
    defaultPlaceholder: 'name@company.com'
  }
];
