import { defineField, defineType } from "sanity";

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
