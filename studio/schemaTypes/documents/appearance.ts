import { defineField, defineType } from "sanity";

const appearanceCategories = [
  { title: "Research", value: "research" },
  { title: "Industry", value: "industry" },
  { title: "Ecosystem", value: "ecosystem" },
];

export default defineType({
  name: "appearance",
  title: "Appearance",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: "person", title: "Person", type: "reference", to: [{ type: "person" }], validation: (Rule: any) => Rule.required() }),
    defineField({ name: "edition", title: "Edition", type: "reference", to: [{ type: "edition" }], validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "organizations",
      title: "Organizations",
      type: "array",
      of: [{ type: "reference", to: [{ type: "organization" }] }],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({ name: "roleTitle", title: "Role title", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: appearanceCategories },
      validation: (Rule: any) => Rule.required().valid(...appearanceCategories.map((item) => item.value)),
    }),
    defineField({ name: "billing", title: "Billing", type: "number", validation: (Rule: any) => Rule.required().integer() }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "thesis", title: "Thesis", type: "text", rows: 3 }),
  ],
});
