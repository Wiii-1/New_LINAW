import { z } from 'zod';

// ==========
// Signup validation schema
// ==========

export const signupSchema = z.object ({
    first_name: z
        .string()
        .min(3, "Must have a minimum of 3 characters")
        .max(40,"First name too long"),

    middle_initial: z
        .string()
        .min(1)
        .max(1),

    last_name: z
        .string()
        .min(3, "Last must be 3 characters minimum ")
        .max(40, " Last name is too long"),

    email: z
        .string()
        .email("Invalid email")
        .trim()
        .toLowerCase(),

    password: z 
        .string()
        .min(12, "Pasword must be at least 12 characters")
        .max(128, "Password is too long"),

    confirmPassword: z
        .string()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Password do not match",
        path: ["confirmPassword"]
    }   
)

// ==========
// Login Validation schema
// ==========

export const loginSchema = z.object ({
    email: z 
        .string()
        .email("Invalid email")
        .trim()
        .toLowerCase,
    
    password: z 
        .string()
        .min(12, " Must be 12 characters long")
        .max(128, "password is too long")
})  

// ==========
// Logout Validation Schema
// ==========

export const logoutSchema = z.object({
    sessionId: z
        .string()
        .uuid("Invalid session Id")
})

// ==========
// Interface
// ==========

export type SigninInput =
    z.infer<typeof signupSchema>

export type LoginInput = 
    z.infer<typeof loginSchema>

export type logoutUser = 
    z.infer<typeof logoutSchema>

