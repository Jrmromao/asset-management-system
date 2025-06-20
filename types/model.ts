import type { Model, Manufacturer } from "@prisma/client";

export interface ModelWithRelations extends Model {
  manufacturer?: Pick<Manufacturer, "name"> | null;
} 