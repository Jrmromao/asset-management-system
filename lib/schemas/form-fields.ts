// import { z } from "zod";
//
// const FIELD_TYPES = [
//   { value: "text", label: "Text" },
//   { value: "number", label: "Number" },
//   { value: "select", label: "Dropdown" },
//   { value: "checkbox", label: "Checkbox" },
// ] as const;
//
// export const formFieldSchema = z.object({
//   name: z.string().min(1, "Field name is required"),
//   type: z.enum("text", "number", "select", "checkbox"),
//   placeholder: z.string().optional(),
//   label: z.string().optional(),
//   required: z.boolean().default(false),
//   options: z.array(z.string()).optional(),
// });
