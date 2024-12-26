export interface CustomFieldOption {
    id: string;
    name: string;
}

export interface CustomField {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'checkbox';
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export interface FormTemplate {
    id: string;
    name: string;
    fields: CustomField[];
}