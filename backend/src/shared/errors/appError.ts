import { extend } from "joi";
import { moveMessagePortToContext } from "node:worker_threads";

export class AppError extends Error {
    constructor (
        message: string,
        public statusCode: number = 400,
        public code: string = "APP_ERROR",
        public details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name

        Error.captureStackTrace?.
        (
            this, 
            this.constructor
        );
    }
}

export class RequestDataError extends AppError {
    constructor (message = "Bad Request", details?:unknown ){
        super(message, 400, "BAD_REQUEST", details)
        this.name = "requestDataError"
    }
}

export class UnauthorizedAccessError extends AppError {
    constructor (message = "Unauthorized", details?:unknown) {
        super(message, 401, "UNAUTHORIZED", details)
        this.name = "unauthorizedAccessError"
    }
}

export class RestrictedAccessError extends AppError {
    constructor (message = "Forbidden", details?:unknown) {
        super(message, 403, "FORBIDDEN", details)
        this.name = "restrictedAccessError"
    }
}

export class NotFoundError extends AppError {
    constructor (message = "Not Found", details?:unknown) {
        super(message, 404, "NOT FOUND", details)
        this.name = "notFoundError"
    }
}

export class ConflictError extends AppError {
    constructor (message = "Conflict", details?:unknown) {
        super(message, 409, "CONFLICT", details)
        this.name = "conflictError"
    }
}

export class InvalidDataError extends AppError {
    constructor (message = "Invalid Data", details?:unknown) {
        super(message, 422, "INVALID DATA", details)
        this.name = "invalidDataError"
    }
}

export class ServerError extends AppError {
    constructor (message = "Server Error", details?:unknown) {
        super(message, 500, "Internal Server Error", details)
        this.name = "serverError"
    }
}

export class ServiceUnavailableError extends AppError {
    constructor (message = "Service Unavailbale", details?:unknown){
        super(message, 503, "SERVICE UNAVAILABLE", details)
        this.name = "serviceUnavailableError"
    }
}