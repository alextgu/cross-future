import { getSqliteSubmissionRepository } from "../../../lib/repositories/sqlite-submission-repository";
import { createContactPost } from "../../../lib/submissions/http-handlers";

export async function POST(request: Request) {
  return createContactPost(getSqliteSubmissionRepository())(request);
}
