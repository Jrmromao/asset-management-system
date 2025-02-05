export interface ColumnsProps<T> {
  onDelete: (value: T) => void;
  onUpdate: (value: T) => void;
  isDeleting?: boolean;
}
