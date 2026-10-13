"use client";

import { cn } from "cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(3, "First name must be at least 3 characters.")
      .max(40, "First name cannot exceed 40 characters."),
    last_name: z
      .string()
      .trim()
      .min(3, "Last name must be at least 3 characters.")
      .max(40, "Last name cannot exceed 40 characters."),
    email: z.email("Please enter a valid email address.").trim(),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password cannot exceed 128 characters."),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof formSchema>;

interface SignupResponse {
  success: boolean;
  message?: string;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      let data: SignupResponse;

      try {
        data = (await response.json()) as SignupResponse;
      } catch {
        setSignupError("Received an invalid response from the server.");
        return;
      }

      if (!response.ok || data.success !== true) {
        setSignupError(
          data.message ?? "Unable to create your account. Please try again.",
        );
        return;
      }

      setSignupSuccess(
        data.message ??
          "Your account has been created. You can now sign in.",
      );

      form.reset();

    } catch {
      setSignupError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        id="signup-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Welcome to LINAW</h1>
            <FieldDescription>
              Already have an account? <a href="/login">Login</a>
            </FieldDescription>
          </div>

          {signupError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {signupError}
            </div>
          )}

          {signupSuccess && (
            <div
              role="status"
              className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm"
            >
              {signupSuccess}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="first_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="first-name">
                    First Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    required
                    maxLength={40}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                  />
                  <FieldError>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />

            <Controller
              name="last_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="last-name">
                    Last Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    required
                    maxLength={40}
                    aria-invalid={fieldState.invalid}
                    className="bg-background"
                  />
                  <FieldError>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                />
                <FieldError>
                  {fieldState.error?.message}
                </FieldError>
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="signup-password">
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                />
                <FieldDescription>
                  Must be between 12 and 128 characters long.
                </FieldDescription>
                <FieldError>
                  {fieldState.error?.message}
                </FieldError>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                />
                <FieldError>
                  {fieldState.error?.message}
                </FieldError>
              </Field>
            )}
          />

          <Field>
            <Button
              type="submit"
              disabled={isLoading}
              form="signup-form"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>

            <Button variant="outline" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        By signing up, you agree to our{" "}
        <a href="/terms-of-service">Terms of Service</a> and{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
