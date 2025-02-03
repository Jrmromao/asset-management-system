export interface CustomFieldOption {
  id: string;
  name: string;
}

export interface CustomField {
  name: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "checkbox" | "boolean";
  required: boolean;
  options?: string[];
  placeholder?: string;
  showIf?: {
    [field: string]: string[];
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: CustomField[];
}

export interface FormProps<T> {
  initialData?: T;
  onSubmitSuccess?: () => void;
}
