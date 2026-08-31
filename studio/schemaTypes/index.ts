import appearance from "./documents/appearance";
import edition from "./documents/edition";
import homePage from "./documents/homePage";
import interview from "./documents/interview";
import organization from "./documents/organization";
import partner from "./documents/partner";
import pastEdition from "./documents/pastEdition";
import person from "./documents/person";
import session from "./documents/session";
import siteSettings from "./documents/siteSettings";
import summitDocument from "./documents/summitDocument";
import track from "./documents/track";
import cloudflareVideo from "./objects/cloudflareVideo";
import mediaAsset from "./objects/mediaAsset";

export const singletonDocumentIds = {
  siteSettings: "siteSettings",
  homePage: "homePage",
} as const;

export const schemaTypes = [
  mediaAsset,
  cloudflareVideo,
  edition,
  person,
  organization,
  appearance,
  track,
  session,
  partner,
  summitDocument,
  interview,
  pastEdition,
  siteSettings,
  homePage,
] as const;

export const documentTypeNames = [
  "edition",
  "person",
  "organization",
  "appearance",
  "track",
  "session",
  "partner",
  "summitDocument",
  "interview",
  "pastEdition",
  "siteSettings",
  "homePage",
] as const;

export function getSchemaType(name: string) {
  return schemaTypes.find((type) => type.name === name);
}
