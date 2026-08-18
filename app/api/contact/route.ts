import { NextResponse } from "next/server";
import { getSqliteSubmissionRepository } from "../../../lib/repositories/sqlite-submission-repository";
import { UnknownEditionError } from "../../../lib/repositories/submission-repository";
import { contactInquirySchema } from "../../../lib/submissions/validation";

export async function POST(request: Request) {
  const parsed = contactInquirySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const { id } = await getSqliteSubmissionRepository().createContactInquiry(
      parsed.data
    );
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof UnknownEditionError) {
      return NextResponse.json(
        { ok: false, fieldErrors: { edition: [error.message] } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        message: "We could not store that submission. Please try again.",
      },
      { status: 500 }
    );
  }
}
