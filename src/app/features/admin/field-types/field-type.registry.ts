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

export const FIELD_TYPE_COMPONENTS: Record<string, Type<unknown>> = {
  text: TextFieldComponent,
  textarea: TextareaFieldComponent,
  number: NumberFieldComponent,
  email: EmailFieldComponent,
  date: DateFieldComponent,
  time: TimeFieldComponent,
  url: UrlFieldComponent,
  select: DropdownFieldComponent,
  dropdown: DropdownFieldComponent,
  radio: RadioFieldComponent,
  checkbox: CheckboxFieldComponent,
  phone: PhoneFieldComponent,
  rating: RatingFieldComponent,
  slider: SliderFieldComponent,
  toggle: ToggleFieldComponent,
  file: FileFieldComponent,
  signature: SignatureFieldComponent,
  color: ColorFieldComponent,
  heading: HeadingFieldComponent,
  paragraph: ParagraphFieldComponent
};

export function getFieldTypeComponent(typeCode: string): Type<unknown> {
  const normalized = (typeCode || '').trim().toLowerCase();
  return FIELD_TYPE_COMPONENTS[normalized] || TextFieldComponent;
}
