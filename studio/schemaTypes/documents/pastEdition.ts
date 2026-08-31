import { defineField, defineType } from "sanity";

export default defineType({
  name: "pastEdition",
  title: "Past edition",
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
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "year", title: "Year", type: "number", validation: (Rule: any) => Rule.required().integer() }),
    defineField({ name: "city", title: "City", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "headline", title: "Headline", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule: any) => Rule.required() }),
            defineField({ name: "value", title: "Value", type: "string", validation: (Rule: any) => Rule.required() }),
          ],
        },
      ],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({ name: "highlights", title: "Highlights", type: "array", of: [{ type: "string" }], validation: (Rule: any) => Rule.required() }),
    defineField({ name: "media", title: "Media", type: "mediaAsset", validation: (Rule: any) => Rule.required() }),
  ],
});
