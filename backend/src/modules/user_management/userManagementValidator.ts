import { z } from "zod"

// ============= 
// Philippine Tax Id Schema
// =============

export const PhilippineTaxIdSchema = z
    .string()
    .trim()
    .regex(/^[0-9-]+$/, "Tax ID may contain only digits and hyphens.")
    .transform((value) => value.replace(/-/g, ""))
    .refine(
        (value) => value.length === 9 || value.length === 12,
        "Tax ID must contain 9 or 12 digits." 
    )


// =============
//  Contact Number schema 
// =============

export const ContactNumberSchema = z
    .string()
    .regex(/^\+?[0-9-]+$/, " Contact Number may contain only digits, hyphens and plus sign")
    .transform((val) => val.replace(/[^0-9]/g, ""))
    .refine((val) => val.length >= 4 && val.length <= 15, {
        message: "Phone number must be between 4 and 15 digits long",
    });

// =============
// UserProfile Update Schema
// =============

export const UserProfileSchema = z.object({
    first_name: z
        .string()
        .min(3, "Must have a minimum of 3 characters")
        .max(40, "First name too long"),

    last_name: z
        .string()
        .min(3, "Must have a minimum of 3 characters")
        .max(40, "First name too long"),

    email: z
        .string()
        .email("Invalid Email")
        .trim()
        .toLowerCase(),

    job_title: z
        .string()
        .min(3, " Must have minimum of 3 characters")
        .max(40)
})

// =============
// Organization Registration Schema
// =============

export const OrganizationRegistrationSchema = z.object({
    legal_name: z
        .string()
        .min(3, " Must be three characters long")
        .max(200),

    display_name: z
        .string()
        .min(3, "Must be three characters long")
        .max(150),

    tax_id: PhilippineTaxIdSchema.optional(),

    address: z
        .string()
        .trim()
        .min(10, " Address is too short ")
        .max(300, " Address is too long"),

    contact_email: z
        .string()
        .trim()
        .email("Invalid Email"),

    contact_phone: ContactNumberSchema.optional()
})

// =============
// Interface
// =============

export type UserProfile =
    z.infer <typeof UserProfileSchema>

export type OrganizationRegistration =
    z.infer <typeof OrganizationRegistrationSchema>