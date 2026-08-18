import type {
  ContactInquiryInput,
  RegistrationInput,
} from "../submissions/contracts";

export interface SubmissionRepository {
  createRegistration(input: RegistrationInput): Promise<{ id: number }>;
  createContactInquiry(input: ContactInquiryInput): Promise<{ id: number }>;
}
