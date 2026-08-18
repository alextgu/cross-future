import { getSqliteSubmissionRepository } from "../../../lib/repositories/sqlite-submission-repository";
import { createRegistrationPost } from "../../../lib/submissions/http-handlers";

export async function POST(request: Request) {
  return createRegistrationPost(getSqliteSubmissionRepository())(request);
}
