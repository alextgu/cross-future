import { defineField, defineType } from "sanity";

const organizationTypes = [
  { title: "Academic", value: "academic" },
  { title: "Academia", value: "academia" },
  { title: "Community", value: "community" },
  { title: "Energy", value: "energy" },
  { title: "Ecosystem", value: "ecosystem" },
  { title: "Industry", value: "industry" },
  { title: "Infrastructure", value: "infrastructure" },
  { title: "Institute", value: "institute" },
  { title: "Non-profit", value: "non-profit" },
  { title: "Nonprofit", value: "nonprofit" },
  { title: "University", value: "university" },
];

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "organization",
  title: "Organization",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "shortName", title: "Short name", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: slugValidation }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: organizationTypes },
      validation: (Rule: any) => Rule.required().valid(...organizationTypes.map((item) => item.value)),
    }),
    defineField({ name: "url", title: "URL", type: "url", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "country", title: "Country", type: "string", validation: (Rule: any) => Rule.required() }),
  ],
});
