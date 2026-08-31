import { defineField, defineType } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home page",
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
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "lede", title: "Lede", type: "text", rows: 3, validation: (Rule: any) => Rule.required() }),
    defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string" }),
    defineField({ name: "primaryCtaHref", title: "Primary CTA href", type: "string" }),
    defineField({ name: "secondaryCtaLabel", title: "Secondary CTA label", type: "string" }),
    defineField({ name: "secondaryCtaHref", title: "Secondary CTA href", type: "string" }),
  ],
});
