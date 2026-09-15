import { DynamicFormField } from '../../../core/models/form.model';
import { FormTemplate } from '../models/form-template.model';

export type { FormTemplate };

export const PREBUILT_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'onboarding',
    title: 'New Hire Onboarding Checklist',
    description: 'Collect personal details, equipment preferences, and legal agreements for new employees.',
    category: 'Human Resources',
    icon: 'fas fa-user-plus',
    badge: 'HR / People',
    fields: [
      {
        fieldKey: 'heading_personal',
        fieldType: 'heading',
        label: 'Personal & Contact Information',
        isRequired: false,
        sortOrder: 1
      },
      {
        fieldKey: 'full_name',
        fieldType: 'text',
        label: 'Full Legal Name',
        placeholder: 'First and last name as per passport/ID',
        isRequired: true,
        sortOrder: 2
      },
      {
        fieldKey: 'work_email',
        fieldType: 'email',
        label: 'Preferred Work Email',
        placeholder: 'username@company.com',
        isRequired: true,
        sortOrder: 3
      },
      {
        fieldKey: 'department',
        fieldType: 'select',
        label: 'Department',
        options: ['Engineering & Technology', 'Product & Design', 'Sales & Marketing', 'Human Resources', 'Finance & Operations'],
        defaultValue: 'Engineering & Technology',
        isRequired: true,
        sortOrder: 4
      },
      {
        fieldKey: 'work_mode',
        fieldType: 'radio',
        label: 'Working Arrangement',
        options: ['On-site Office', 'Hybrid (3 days in office)', 'Fully Remote'],
        defaultValue: 'Hybrid (3 days in office)',
        isRequired: true,
        sortOrder: 5
      },
      {
        fieldKey: 'start_date',
        fieldType: 'date',
        label: 'Official Start Date',
        isRequired: true,
        sortOrder: 6
      },
      {
        fieldKey: 'emergency_contact',
        fieldType: 'textarea',
        label: 'Emergency Contact Details',
        placeholder: 'Name, Relationship, and Phone Number',
        isRequired: true,
        sortOrder: 7
      },
      {
        fieldKey: 'handbook_ack',
        fieldType: 'checkbox',
        label: 'I confirm receiving and agreeing to the Employee Code of Conduct.',
        defaultValue: 'true',
        isRequired: true,
        sortOrder: 8
      }
    ]
  },
  {
    id: 'equipment',
    title: 'IT Asset & Hardware Request',
    description: 'Streamlined procurement request for laptops, monitors, accessories, and development equipment.',
    category: 'IT Support',
    icon: 'fas fa-laptop',
    badge: 'IT & Facilities',
    fields: [
      {
        fieldKey: 'heading_equipment',
        fieldType: 'heading',
        label: 'Hardware & Accessories Selection',
        isRequired: false,
        sortOrder: 1
      },
      {
        fieldKey: 'hardware_model',
        fieldType: 'select',
        label: 'Primary Workstation / Laptop',
        options: ['Apple MacBook Pro 16" (M3 Max, 36GB)', 'Apple MacBook Air 15" (M3, 16GB)', 'Dell Precision 5680 Workstation', 'Lenovo ThinkPad X1 Carbon'],
        defaultValue: 'Apple MacBook Pro 16" (M3 Max, 36GB)',
        isRequired: true,
        sortOrder: 2
      },
      {
        fieldKey: 'quantity',
        fieldType: 'number',
        label: 'Quantity Required',
        defaultValue: '1',
        isRequired: true,
        sortOrder: 3
      },
      {
        fieldKey: 'urgency',
        fieldType: 'select',
        label: 'Procurement Priority',
        options: ['Standard (1-2 Weeks)', 'High Priority (Within 3 Days)', 'Critical / Replacement (Immediate)'],
        defaultValue: 'Standard (1-2 Weeks)',
        isRequired: true,
        sortOrder: 4
      },
      {
        fieldKey: 'justification',
        fieldType: 'textarea',
        label: 'Business Justification',
        placeholder: 'Explain the project need or software requirements for this hardware...',
        defaultValue: 'Standard workstation upgrade for engineering development workflow.',
        isRequired: true,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'leave',
    title: 'Employee Leave Application',
    description: 'Submit planned vacation, medical leave, or personal time-off requests with coverage plans.',
    category: 'Operations',
    icon: 'fas fa-umbrella-beach',
    badge: 'Time Off',
    fields: [
      {
        fieldKey: 'heading_leave',
        fieldType: 'heading',
        label: 'Time-Off Details',
        isRequired: false,
        sortOrder: 1
      },
      {
        fieldKey: 'leave_type',
        fieldType: 'select',
        label: 'Leave Category',
        options: ['Annual Paid Vacation', 'Sick / Medical Leave', 'Parental Leave', 'Bereavement', 'Unpaid Leave of Absence'],
        defaultValue: 'Annual Paid Vacation',
        isRequired: true,
        sortOrder: 2
      },
      {
        fieldKey: 'from_date',
        fieldType: 'date',
        label: 'Leave Start Date',
        isRequired: true,
        sortOrder: 3
      },
      {
        fieldKey: 'to_date',
        fieldType: 'date',
        label: 'Leave End Date',
        isRequired: true,
        sortOrder: 4
      },
      {
        fieldKey: 'coverage_plan',
        fieldType: 'textarea',
        label: 'Duty Handover & Coverage Plan',
        placeholder: 'List teammates covering your critical responsibilities during your absence...',
        isRequired: false,
        sortOrder: 5
      }
    ]
  },
  {
    id: 'feedback',
    title: 'Quarterly Team Satisfaction & Feedback',
    description: 'Anonymous pulse check on team morale, management support, and tool efficiency.',
    category: 'General',
    icon: 'fas fa-heart-pulse',
    badge: 'Pulse Survey',
    fields: [
      {
        fieldKey: 'heading_survey',
        fieldType: 'heading',
        label: 'Morale & Environment',
        isRequired: false,
        sortOrder: 1
      },
      {
        fieldKey: 'rating',
        fieldType: 'select',
        label: 'How satisfied are you with work-life balance and team support?',
        options: ['5 - Extremely Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Needs Improvement', '1 - Dissatisfied'],
        defaultValue: '5 - Extremely Satisfied',
        isRequired: true,
        sortOrder: 2
      },
      {
        fieldKey: 'positives',
        fieldType: 'textarea',
        label: 'What went exceptionally well this quarter?',
        placeholder: 'Share accomplishments or great team collaborations...',
        isRequired: true,
        sortOrder: 3
      },
      {
        fieldKey: 'improvements',
        fieldType: 'textarea',
        label: 'Suggestions to make our engineering processes smoother:',
        placeholder: 'Tools, automation, meetings, or process enhancements...',
        isRequired: false,
        sortOrder: 4
      }
    ]
  }
];
