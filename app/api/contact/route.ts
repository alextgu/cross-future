import {
  createD1SubmissionRepository,
  getD1SubmissionDatabase,
} from "../../../lib/repositories/d1-submission-repository";
import { getSqliteSubmissionRepository } from "../../../lib/repositories/sqlite-submission-repository";
import { createContactPost } from "../../../lib/submissions/http-handlers";

export async function POST(request: Request) {
  const d1 = getD1SubmissionDatabase();
  if (process.env.NODE_ENV === "production" && !d1) {
    return Response.json(
      { ok: false, message: "Submission storage is not configured." },
      { status: 503 }
    );
  }
  return createContactPost(
    d1 ? createD1SubmissionRepository(d1) : getSqliteSubmissionRepository()
  )(request);
}
