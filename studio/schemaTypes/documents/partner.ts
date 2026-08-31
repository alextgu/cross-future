import { defineField, defineType } from "sanity";

const partnerTypes = [
  { title: "Community", value: "community" },
  { title: "Energy", value: "energy" },
  { title: "Infrastructure", value: "infrastructure" },
];

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "partner",
  title: "Partner",
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
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: slugValidation }),
    defineField({ name: "logo", title: "Logo", type: "mediaAsset", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "url", title: "URL", type: "url", validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: partnerTypes },
      validation: (Rule: any) => Rule.required().valid(...partnerTypes.map((item) => item.value)),
    }),
  ],
});
