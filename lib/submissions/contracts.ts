export const REGISTRATION_WORK_AREAS = [
  "The grid — utility, interconnection, planning",
  "The facility — electrical, mechanical, controls",
  "The compute — platform, workloads, silicon",
  "Research",
  "Policy, finance or ecosystem",
] as const;

export const CONTACT_INQUIRY_TYPES = [
  "General information",
  "Registration and tickets",
  "Speaking and programme",
  "Partnership and sponsorship",
  "Media and press",
  "Accessibility",
] as const;

export interface RegistrationInput {
  edition: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  closest: (typeof REGISTRATION_WORK_AREAS)[number];
  access: string;
}

export interface ContactInquiryInput {
  edition: string;
  firstName: string;
  lastName: string;
  email: string;
  inquiry: (typeof CONTACT_INQUIRY_TYPES)[number];
  message: string;
}
