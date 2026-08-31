import { defineField, defineType } from "sanity";

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "person",
  title: "Person",
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
    defineField({ name: "firstName", title: "First name", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "lastName", title: "Last name", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "firstName" }, validation: slugValidation }),
    defineField({ name: "headshot", title: "Headshot", type: "mediaAsset", validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule: any) => Rule.required(),
            }),
          ],
        },
      ],
      initialValue: [],
    }),
    defineField({ name: "verified", title: "Verified", type: "boolean", initialValue: false }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 4, validation: (Rule: any) => Rule.required() }),
  ],
});
