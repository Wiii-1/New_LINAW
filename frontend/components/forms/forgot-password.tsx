"use client";

import { useState } from "react";
import { cn } from "cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

interface ApiResponse {
  success: boolean;
  message?: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || data.success !== true) {
        setError(data.message ?? "Unable to process your request. Please try again.");
        return;
      }

      setSuccess(
        data.message ??
          "If an account exists for that email, a password reset link will be sent shortly.",
      );
    } catch {
      setError("Unable to contact the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        id="forgot-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Recover your Account</h1>
            <FieldDescription>
              Enter your email to receive a password reset link.
            </FieldDescription>
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={fieldState.invalid}
                  className="bg-background"
                  disabled={isLoading || Boolean(success)}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </Field>
            )}
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-600">
              {success}
            </p>
          )}

          <Field>
            <Button
              type="submit"
              disabled={isLoading || Boolean(success)}
              form="forgot-password-form"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Remembered your password?{" "}
            <a href="/login" className="underline underline-offset-4">
              Back to login
            </a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
