import * as z from "zod";

export const loginSchema = z.object({
  email: z.email().min(1),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(128, "Password must not exceed 128 characters."),
});

export const signUpSchema = z
  .object({
    username: z.string().min(3),
    email: z.email().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email().min(1),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password must not exceed 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
