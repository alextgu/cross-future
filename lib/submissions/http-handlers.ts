import { NextResponse } from "next/server";
import {
  UnknownEditionError,
  type SubmissionRepository,
} from "../repositories/submission-repository";
import { contactInquirySchema, registrationSchema } from "./validation";

function invalidFields(fieldErrors: Record<string, string[] | undefined>) {
  return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });
}

function storageFailure(error: unknown) {
  if (error instanceof UnknownEditionError) {
    return invalidFields({ edition: [error.message] });
  }
  return NextResponse.json(
    {
      ok: false,
      message: "We could not store that submission. Please try again.",
    },
    { status: 500 }
  );
}

export function createRegistrationPost(repository: SubmissionRepository) {
  return async function postRegistration(request: Request) {
    const parsed = registrationSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return invalidFields(parsed.error.flatten().fieldErrors);
    }

    try {
      const { id } = await repository.createRegistration(parsed.data);
      return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (error) {
      return storageFailure(error);
    }
  };
}

export function createContactPost(repository: SubmissionRepository) {
  return async function postContact(request: Request) {
    const parsed = contactInquirySchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return invalidFields(parsed.error.flatten().fieldErrors);
    }

    try {
      const { id } = await repository.createContactInquiry(parsed.data);
      return NextResponse.json({ ok: true, id }, { status: 201 });
    } catch (error) {
      return storageFailure(error);
    }
  };
}
