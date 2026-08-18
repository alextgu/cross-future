import type {
  ContactInquiryInput,
  RegistrationInput,
} from "../submissions/contracts";

export class UnknownEditionError extends Error {
  constructor() {
    super("The selected edition is not open for submissions.");
    this.name = "UnknownEditionError";
  }
}

export interface SubmissionRepository {
  createRegistration(input: RegistrationInput): Promise<{ id: number }>;
  createContactInquiry(input: ContactInquiryInput): Promise<{ id: number }>;
}
