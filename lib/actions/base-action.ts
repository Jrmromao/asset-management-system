// lib/base-server-action.ts
import { revalidatePath } from "next/cache";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BaseServerAction<T> {
  protected dbModel: any;
  protected entityName: string;
  protected revalidatePaths: string[];

  constructor(
    entityName: string,
    dbModel: any,
    revalidatePaths: string[] = [],
  ) {
    this.entityName = entityName;
    this.dbModel = dbModel;
    this.revalidatePaths = revalidatePaths;
  }

  protected async handleServerAction<R>(
    operation: () => Promise<R>,
    errorMessage: string,
  ): Promise<ActionResponse<R>> {
    try {
      const data = await operation();
      this.revalidatePaths.forEach((path) => revalidatePath(path));

      return {
        data,
        message: `${this.entityName} operation successful`,
        success: true,
      };
    } catch (error) {
      console.error(`${this.entityName} operation failed:`, error);
      return {
        message: errorMessage,
        success: false,
      };
    }
  }
}

// export class BaseServerAction<T extends BaseEntity> {
//   protected entityName: string;
//   protected revalidatePaths: string[];
//   protected dbModel: any; // Your database model (e.g., Prisma model)
//
//   constructor(
//     entityName: string,
//     dbModel: any,
//     revalidatePaths: string[] = [],
//   ) {
//     this.entityName = entityName;
//     this.dbModel = dbModel;
//     this.revalidatePaths = revalidatePaths;
//   }
//
//   protected async handleServerAction<R>(
//     operation: () => Promise<R>,
//     errorMessage: string,
//   ): Promise<ActionResponse<R>> {
//     try {
//       const data = await operation();
//
//       // Revalidate all specified paths
//       this.revalidatePaths.forEach((path) => revalidatePath(path));
//
//       return {
//         data,
//         message: `${this.entityName} operation successful`,
//         success: true,
//       };
//     } catch (error) {
//       console.error(`${this.entityName} operation failed:`, error);
//       return {
//         message: errorMessage,
//         success: false,
//       };
//     }
//   }
//
//   async create(data: Partial<T>) {
//     return this.handleServerAction(async () => {
//       "use server";
//       return await this.dbModel.create({
//         data,
//       });
//     }, `Failed to create ${this.entityName}`);
//   }
//
//   async update(id: string, data: Partial<T>) {
//     return this.handleServerAction(async () => {
//       "use server";
//       return await this.dbModel.update({
//         where: { id },
//         data,
//       });
//     }, `Failed to update ${this.entityName}`);
//   }
//
//   async delete(id: string) {
//     return this.handleServerAction(async () => {
//       "use server";
//       await this.dbModel.delete({
//         where: { id },
//       });
//       return true;
//     }, `Failed to delete ${this.entityName}`);
//   }
//
//   async getById(id: string) {
//     return this.handleServerAction(async () => {
//       "use server";
//       return await this.dbModel.findUnique({
//         where: { id },
//       });
//     }, `Failed to fetch ${this.entityName}`);
//   }
//
//   async getAll(params?: Record<string, any>) {
//     return this.handleServerAction(async () => {
//       "use server";
//       return await this.dbModel.findMany({
//         where: params,
//       });
//     }, `Failed to fetch ${this.entityName}s`);
//   }
// }
