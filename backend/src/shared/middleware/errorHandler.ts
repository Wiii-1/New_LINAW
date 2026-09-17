import { Context } from "hono";
import { AppError } from "../errors/appError.js";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function errorHandler(
    err: Error,
    c: Context
) {
    console.error(err)

    if (err instanceof AppError) {
        return c.json(
            {
                success: false,
                error: {
                    code: err.code,
                    message: err.message,

                    ...(process.env.NODE_ENV === "development" && {
                        details: err.details,
                    }),
                },
            },
            err.statusCode as ContentfulStatusCode,
        );
    }

    return c.json(
        {
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "something went wrong"
            },
        },
        500,
    )
}