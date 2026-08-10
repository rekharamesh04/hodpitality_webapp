import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const guestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  company: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  room: z.string().optional(),
  eventId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type GuestInput = z.infer<typeof guestSchema>;

export const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  venueId: z.string().min(1, "Venue is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  category: z.string().min(1, "Category is required"),
  organizer: z.string().min(1, "Organizer is required"),
});
export type EventInput = z.infer<typeof eventSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  department: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
