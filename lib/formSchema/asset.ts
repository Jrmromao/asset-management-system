import {z} from "zod";

export const assetFormSchema = () => z.object({
    name: z.string().min(1, "Name is required"),
    id: z.string().optional(),
    purchaseNotes: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().min(1, "Model is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    category: z.string().min(1, "Category is required"),
    purchasePrice: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number")
        .min(1, "Amount is too short"),

})
