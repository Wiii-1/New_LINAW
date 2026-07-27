import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    
    console.error (err)

    if (err instanceof AppError) {
        
        return res.status(err.statusCode).json({
            success: false,

            error:{
                code:err.code,
                message:err.message,

                ...(process.env.NODE_ENV === "development" && {
                    details:err.details
                }) 
            }
        })
    }

    return res.status(500).json({

        success:false,

        error:{
            code:"INTERNAL_SERVER_ERROR",
            message:"Something went wrong"
        }
    })
}