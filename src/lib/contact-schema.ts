import { z } from "zod";

/**
 * Shape of a contact-form submission.
 *
 * Shared by the browser and the API route so the two can't drift apart — but
 * the server always re-validates. Client-side validation is a convenience for
 * the user, never a security boundary: anyone can POST straight to the route.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  country: z.string().trim().max(100).optional().default(""),
  interest: z.string().trim().max(120).optional().default(""),
  quantity: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(4000),

  // Honeypot. Hidden from real users via CSS and skipped by tab order, so a
  // human never fills it — but naive bots fill every input they find. Any
  // value here means the submission is automated.
  //
  // Deliberately permissive: rejecting it here would return a validation error
  // naming this field, which tells a bot author exactly which input to leave
  // blank next time. The route silently accepts-and-discards instead, so the
  // bot sees an ordinary success and has nothing to adapt to.
  website: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
