import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
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
    defineField({ name: "siteTitle", title: "Site title", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule: any) => Rule.required() }),
            defineField({ name: "href", title: "Href", type: "string", validation: (Rule: any) => Rule.required() }),
          ],
        },
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule: any) => Rule.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (Rule: any) => Rule.required() }),
          ],
        },
      ],
    }),
    defineField({ name: "supportEmail", title: "Support email", type: "string" }),
  ],
});
