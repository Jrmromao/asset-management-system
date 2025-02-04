export interface CustomFieldOption {
  id: string;
  name: string;
}

export interface CustomField {
  name: string;
  label: string;
  type: "number" | "boolean" | "text" | "select" | "date" | "checkbox";
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
  active: boolean;
  fields: CustomField[];
}

export interface FormProps<T> {
  initialData?: T;
  onSubmitSuccess?: () => void;
}
