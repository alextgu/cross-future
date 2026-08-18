import { z } from "zod";
import {
  CONTACT_INQUIRY_TYPES,
  REGISTRATION_WORK_AREAS,
} from "./contracts";

const compactText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const email = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email is too long.")
  .transform((value) => value.toLowerCase());

export const registrationSchema = z
  .object({
    edition: compactText("Edition", 80),
    firstName: compactText("First name", 100),
    lastName: compactText("Last name", 100),
    email,
    organization: z.string().trim().max(180, "Organization is too long."),
    closest: z.enum(REGISTRATION_WORK_AREAS),
    access: z.string().trim().max(2000, "Access note is too long."),
  })
  .strict();

export const contactInquirySchema = z
  .object({
    edition: compactText("Edition", 80),
    firstName: compactText("First name", 100),
    lastName: compactText("Last name", 100),
    email,
    inquiry: z.enum(CONTACT_INQUIRY_TYPES),
    message: compactText("Message", 4000),
  })
  .strict();
