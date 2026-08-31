import { defineField, defineType } from "sanity";

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "interview",
  title: "Interview",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({ name: "code", title: "Code", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: slugValidation }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "person", title: "Person", type: "reference", to: [{ type: "person" }], validation: (Rule: any) => Rule.required() }),
    defineField({ name: "durationMin", title: "Duration (min)", type: "number", validation: (Rule: any) => Rule.required().integer() }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "editionYear", title: "Edition year", type: "number" }),
    defineField({ name: "topics", title: "Topics", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "pullQuote", title: "Pull quote", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Image", type: "mediaAsset" }),
    defineField({ name: "video", title: "Video", type: "cloudflareVideo" }),
    defineField({ name: "url", title: "URL", type: "url" }),
  ],
});
