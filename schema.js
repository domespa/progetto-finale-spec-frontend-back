// THIS FILE IS AUTO-GENERATED from types.ts - DO NOT EDIT DIRECTLY
import z from 'zod';


// Schema generated from types.ts Product type
export const ProductSchema = z.object({
  id: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  title: z.string({ required_error: "Title is required" }),
  category: z.string({ required_error: "Category is required" }),
  cpu: z.string().optional(),
  speedCpu: z.number().optional(),
  ram: z.number().optional(),
  hardDriveType: z.string().optional(),
  storage: z.number().optional(),
  gpu: z.string().optional(),
  gpuRam: z.number().optional(),
  displayPanel: z.string().optional(),
  screenInch: z.number().optional(),
  refreshRate: z.number().optional(),
  price: z.number(),
  brand: z.string().optional(),
  releaseYear: z.number().optional(),
  image: z.string(),
  serialNumber: z.string().optional(), // readonly in TypeScript
}).strict(); // Add strict mode to reject extra properties


export function validateProduct(data) {
  try {
    const result = ProductSchema.parse(data);
    return { valid: true, data: result };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
}

// Export all validators as a map for dynamic usage
export const validators = {
  "product": validateProduct
};

// Export readonly properties for each type to prevent updates
export const readonlyProperties = {
  "product": ["serialNumber"]
};
