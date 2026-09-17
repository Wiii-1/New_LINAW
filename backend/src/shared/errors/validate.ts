import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod/v3";
import { InvalidDataError } from "./appError.js";

export const validate = (schema:AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);

        if (!result.success) {
            const errorDetails = result.error.flatten((issue) => issue.message).fieldErrors;
            
            // This instantiates your existing class from File 1
            return next(new InvalidDataError("Validation failed", errorDetails));
        }

        req.body = result.data;
        next();
    };
}