import { z } from "zod";

export const SupplierIdSchema = z.object({
    supplierId: z.uuid("Invalid supplier ID."),
});

export type SupplierIdParams = z.infer<typeof SupplierIdSchema>;
