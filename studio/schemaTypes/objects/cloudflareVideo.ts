import { defineField, defineType, type ObjectInputProps } from "sanity";
import { createElement } from "react";
import CloudflareVideoInput, { type CloudflareVideoValue } from "../../components/CloudflareVideoInput";

// Only the short-lived Studio upload credential is passed to the browser. The
// long-lived Cloudflare Stream token remains server-only in the Next route.
const configuredApiOrigin = process.env.SANITY_STUDIO_VIDEO_UPLOAD_API_ORIGIN
  ?? process.env.NEXT_PUBLIC_VIDEO_UPLOAD_API_ORIGIN
  ?? "";
const configuredAuthToken = process.env.SANITY_STUDIO_UPLOAD_TOKEN;

const configuredCloudflareVideoInput = (props: ObjectInputProps<CloudflareVideoValue>) => createElement(
  CloudflareVideoInput,
  { ...props, apiOrigin: configuredApiOrigin, authToken: configuredAuthToken },
);

const statusValues = [
  { title: "Queued", value: "queued" },
  { title: "Processing", value: "processing" },
  { title: "Ready", value: "ready" },
  { title: "Failed", value: "failed" },
];

export default defineType({
  name: "cloudflareVideo",
  title: "Cloudflare video",
  type: "object",
  components: { input: configuredCloudflareVideoInput },
  fields: [
    defineField({
      name: "streamUid",
      title: "Stream UID",
      type: "string",
      validation: (Rule: any) =>
        Rule.required().regex(/^[A-Za-z0-9_-]{8,}$/, {
          name: "stream UID",
          invert: false,
        }),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: statusValues },
      validation: (Rule: any) => Rule.required().valid(...statusValues.map((item) => item.value)),
    }),
    defineField({
      name: "posterUrl",
      title: "Poster URL",
      type: "url",
    }),
    defineField({
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
      validation: (Rule: any) => Rule.min(0),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "credit",
      title: "Credit",
      type: "string",
    }),
    defineField({
      name: "aspect",
      title: "Aspect ratio",
      type: "string",
    }),
  ],
});
